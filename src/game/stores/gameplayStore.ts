import { create } from 'zustand'

import { computePuzzleSolved } from '@/game/logic/completion/winState'
import { CELL_COUNT } from '@/game/logic/pathing/cellMath'
import { applyHoverPathStep, type PathStepLint } from '@/game/logic/pathing/pathMutation'
import type { PathsState } from '@/game/logic/pathing/occupation'
import {
  initialPathForPointerDown,
  isEndpointForColor,
  pairsFromRecord,
  resolveColorUnderPointer,
} from '@/game/logic/validation/pointerRouting'
import type { CcColorKey } from '@/lib/palette'
import { buildPuzzleFromNodes, pairEndpointsRecord } from '@/types/puzzle'
import type { BoardNode, GridCell } from '@/types/grid'

export type GameplaySnapshot = {
  paths: PathsState
  sessionColor: CcColorKey | null
  solved: boolean
  solvedAtMs: number | null
  lastPathLint: PathStepLint | 'idle'
}

type PairMap = Record<CcColorKey, { a: GridCell; b: GridCell }>

type GameplayStore = GameplaySnapshot & {
  pairByColor: PairMap
  lastAppliedHover: GridCell | null
  scratchOcc: Uint8Array
  initFromNodes: (nodes: readonly BoardNode[]) => void
  beginPointer: (cell: GridCell | null, nodes: readonly BoardNode[]) => void
  applyHoverDuringSession: (cell: GridCell | null) => void
  endPointerSession: () => void
  resetRound: () => void
}

function winTransition(
  pairByColor: PairMap,
  paths: PathsState,
  wasSolved: boolean,
  prevSolvedAt: number | null,
): Pick<GameplaySnapshot, 'solved' | 'solvedAtMs'> {
  const pairs = pairsFromRecord(pairByColor)
  const solved = computePuzzleSolved(pairs, paths)
  if (solved && !wasSolved) {
    return { solved: true, solvedAtMs: performance.now() }
  }
  if (!solved) {
    return { solved: false, solvedAtMs: null }
  }
  return { solved: true, solvedAtMs: prevSolvedAt }
}

export const useGameplayStore = create<GameplayStore>((set, get) => ({
  pairByColor: {} as PairMap,
  paths: {},
  sessionColor: null,
  lastAppliedHover: null,
  scratchOcc: new Uint8Array(CELL_COUNT),
  solved: false,
  solvedAtMs: null,
  lastPathLint: 'idle',

  initFromNodes: (nodes) => {
    const puzzle = buildPuzzleFromNodes(nodes)
    const pairByColor = pairEndpointsRecord(puzzle.pairs)
    const paths: PathsState = {}
    for (const p of puzzle.pairs) {
      paths[p.color] = []
    }
    set({
      pairByColor,
      paths,
      sessionColor: null,
      lastAppliedHover: null,
      solved: false,
      solvedAtMs: null,
      lastPathLint: 'idle',
    })
  },

  beginPointer: (cell, nodes) => {
    if (!cell) {
      set({ sessionColor: null, lastAppliedHover: null, lastPathLint: 'idle' })
      return
    }

    const { paths, pairByColor } = get()
    const color = resolveColorUnderPointer(cell, nodes, paths)
    if (!color) {
      set({ sessionColor: null, lastAppliedHover: null, lastPathLint: 'idle' })
      return
    }

    const existing = paths[color] ?? []
    if (existing.length > 0 && isEndpointForColor(cell, color, pairByColor)) {
      const nextPaths = { ...paths, [color]: [] }
      const win = winTransition(pairByColor, nextPaths, get().solved, get().solvedAtMs)
      set({
        paths: nextPaths,
        sessionColor: null,
        lastAppliedHover: null,
        lastPathLint: 'idle',
        ...win,
      })
      return
    }

    const nextPath = initialPathForPointerDown(color, cell, paths, pairByColor)
    if (!nextPath) {
      set({ sessionColor: null, lastAppliedHover: null, lastPathLint: 'idle' })
      return
    }

    const nextPaths = { ...paths, [color]: nextPath }
    const win = winTransition(pairByColor, nextPaths, get().solved, get().solvedAtMs)
    set({
      paths: nextPaths,
      sessionColor: color,
      lastAppliedHover: null,
      lastPathLint: 'idle',
      ...win,
    })
  },

  applyHoverDuringSession: (cell) => {
    if (!cell) return
    const { sessionColor, paths, lastAppliedHover, scratchOcc, pairByColor, solved, solvedAtMs } =
      get()
    if (!sessionColor) return

    const result = applyHoverPathStep(
      paths,
      sessionColor,
      cell,
      lastAppliedHover,
      scratchOcc,
      pairByColor,
    )

    if (!result.changed) {
      set({
        lastAppliedHover: cell,
        lastPathLint: result.lint,
      })
      return
    }

    const nextPaths = {
      ...paths,
      ...(result.coercedTruncations ?? {}),
      [sessionColor]: result.nextPath,
    }
    const win = winTransition(pairByColor, nextPaths, solved, solvedAtMs)
    set({
      paths: nextPaths,
      lastAppliedHover: cell,
      lastPathLint: result.lint,
      ...win,
    })
  },

  endPointerSession: () => {
    set({ sessionColor: null, lastAppliedHover: null, lastPathLint: 'idle' })
  },

  resetRound: () => {
    const { pairByColor } = get()
    const paths: PathsState = {}
    for (const color of Object.keys(pairByColor) as CcColorKey[]) {
      paths[color] = []
    }
    set({
      paths,
      sessionColor: null,
      lastAppliedHover: null,
      solved: false,
      solvedAtMs: null,
      lastPathLint: 'idle',
    })
  },
}))
