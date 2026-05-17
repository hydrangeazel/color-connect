import { create } from 'zustand'

import type { LoadedPuzzle } from '@/game/levels/loaders/puzzleLoader'
import { hydrateProgress } from '@/game/levels/persistence/hydrateProgress'
import {
  readSaveFromLocalStorage,
  writeSaveToLocalStorage,
} from '@/game/levels/persistence/localStorageDriver'
import type { SaveFileV1 } from '@/game/levels/persistence/saveSchema'
import { BUILTIN_PUZZLES } from '@/game/levels/registry/builtinCatalog'
import type { PuzzleRecordV1 } from '@/game/levels/schemas/puzzleRecord'
import { useGameplayStore } from '@/game/stores/gameplayStore'
import { useSettingsStore } from '@/game/stores/settingsStore'
import type { BoardNode } from '@/types/grid'

export type LevelTransition = 'idle' | 'entering' | 'playing' | 'solved' | 'switching'

export type LevelFlowSnapshot = {
  activePuzzleId: string | null
  activeRecord: PuzzleRecordV1 | null
  boardNodes: BoardNode[]
  transition: LevelTransition
  activeIndex: number
  unlockedLevelIds: string[]
  solvedLevelIds: string[]
  levelStartedAt: number | null
  boardRevision: number
}

type LevelFlowStore = LevelFlowSnapshot & {
  catalog: readonly LoadedPuzzle[]

  bootstrapBuiltinCatalog: () => void
  loadPuzzleAtIndex: (index: number) => void
  /** Ephemeral puzzle (e.g. procedural); does not replace catalog index. */
  playGeneratedPuzzle: (entry: LoadedPuzzle) => void
  restartCurrentLevel: () => void
  advanceToNextPuzzle: () => void
  onPuzzleSolved: () => void
  persist: () => void
  applyDiskSnapshotForTests: (save: SaveFileV1 | null) => void
}

function applySettingsFromSave(save: SaveFileV1) {
  const prm = save.settings?.prefersReducedMotion
  if (prm !== undefined) {
    useSettingsStore.getState().setPrefersReducedMotion(prm)
  }
}

export const useLevelFlowStore = create<LevelFlowStore>((set, get) => ({
  catalog: BUILTIN_PUZZLES,
  activeIndex: 0,
  activePuzzleId: null,
  activeRecord: null,
  boardNodes: [],
  transition: 'idle',
  unlockedLevelIds: [],
  solvedLevelIds: [],
  levelStartedAt: null,
  boardRevision: 0,

  bootstrapBuiltinCatalog: () => {
    const disk = readSaveFromLocalStorage()
    const { save, startIndex } = hydrateProgress(disk, BUILTIN_PUZZLES)
    applySettingsFromSave(save)
    set({
      catalog: BUILTIN_PUZZLES,
      unlockedLevelIds: save.unlockedLevelIds,
      solvedLevelIds: save.solvedLevelIds,
      activeIndex: startIndex,
      activePuzzleId: null,
      activeRecord: null,
      boardNodes: [],
      transition: 'idle',
      levelStartedAt: null,
      boardRevision: 0,
    })
    get().loadPuzzleAtIndex(startIndex)
  },

  loadPuzzleAtIndex: (index) => {
    const { catalog } = get()
    if (index < 0 || index >= catalog.length) return
    const entry = catalog[index]

    set({
      transition: 'switching',
      activeIndex: index,
    })

    requestAnimationFrame(() => {
      set({
        activePuzzleId: entry.id,
        activeRecord: entry.record,
        boardNodes: entry.nodes,
        transition: 'entering',
        levelStartedAt: performance.now(),
        boardRevision: get().boardRevision + 1,
      })

      requestAnimationFrame(() => {
        set({ transition: 'playing' })
        get().persist()
      })
    })
  },

  playGeneratedPuzzle: (entry) => {
    set({ transition: 'switching' })
    requestAnimationFrame(() => {
      set({
        activePuzzleId: entry.id,
        activeRecord: entry.record,
        boardNodes: entry.nodes,
        transition: 'entering',
        levelStartedAt: performance.now(),
        boardRevision: get().boardRevision + 1,
      })
      requestAnimationFrame(() => {
        set({ transition: 'playing' })
        get().persist()
      })
    })
  },

  restartCurrentLevel: () => {
    useGameplayStore.getState().resetRound()
    set((s) => ({
      transition: 'entering',
      levelStartedAt: performance.now(),
      boardRevision: s.boardRevision + 1,
    }))
    requestAnimationFrame(() => {
      set({ transition: 'playing' })
    })
  },

  advanceToNextPuzzle: () => {
    const { activeIndex, catalog, unlockedLevelIds } = get()
    const next = activeIndex + 1
    if (next >= catalog.length) return
    const id = catalog[next].id
    if (!unlockedLevelIds.includes(id)) return
    get().loadPuzzleAtIndex(next)
  },

  onPuzzleSolved: () => {
    const id = get().activePuzzleId
    if (!id) return
    if (get().solvedLevelIds.includes(id)) return

    const catalog = get().catalog
    if (!catalog.some((p) => p.id === id)) return

    const solved = [...get().solvedLevelIds, id]
    const idx = catalog.findIndex((p) => p.id === id)
    const nextId = catalog[idx + 1]?.id
    let unlocked = get().unlockedLevelIds
    if (nextId && !unlocked.includes(nextId)) {
      unlocked = [...unlocked, nextId]
    }

    set({
      solvedLevelIds: solved,
      unlockedLevelIds: unlocked,
      transition: 'solved',
    })
    get().persist()
  },

  persist: () => {
    const { unlockedLevelIds, solvedLevelIds, activePuzzleId, catalog, activeIndex } = get()
    const catalogIds = new Set(catalog.map((c) => c.id))
    const currentLevelId =
      activePuzzleId && catalogIds.has(activePuzzleId)
        ? activePuzzleId
        : (catalog[activeIndex]?.id ?? activePuzzleId)
    const payload: SaveFileV1 = {
      v: 1,
      unlockedLevelIds,
      solvedLevelIds,
      currentLevelId,
      settings: {
        prefersReducedMotion: useSettingsStore.getState().prefersReducedMotion,
      },
    }
    writeSaveToLocalStorage(payload)
  },

  applyDiskSnapshotForTests: (save) => {
    const { save: merged, startIndex } = hydrateProgress(save, BUILTIN_PUZZLES)
    applySettingsFromSave(merged)
    set({
      unlockedLevelIds: merged.unlockedLevelIds,
      solvedLevelIds: merged.solvedLevelIds,
      activeIndex: startIndex,
    })
    get().loadPuzzleAtIndex(startIndex)
  },
}))
