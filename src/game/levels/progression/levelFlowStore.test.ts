import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { loadCatalogEntry } from '@/game/levels/loaders/puzzleLoader'
import {
  clearSaveFromLocalStorage,
  writeSaveToLocalStorage,
} from '@/game/levels/persistence/localStorageDriver'
import { BUILTIN_PUZZLES } from '@/game/levels/registry/builtinCatalog'
import type { SaveFileV1 } from '@/game/levels/persistence/saveSchema'
import { useLevelFlowStore } from '@/game/levels/progression/levelFlowStore'
import type { PuzzleRecordV1 } from '@/game/levels/schemas/puzzleRecord'

function puzzle(id: string, colShift: number): PuzzleRecordV1 {
  return {
    version: 1,
    id,
    title: id,
    size: 8,
    difficulty: 'beginner',
    palette: 'cozy-default',
    pairs: [
      { color: 'moss', a: { col: colShift, row: 0 }, b: { col: colShift + 1, row: 0 } },
      { color: 'rose', a: { col: colShift, row: 1 }, b: { col: colShift + 1, row: 1 } },
    ],
  }
}

function memoryLocalStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v)
    },
    removeItem: (k: string) => {
      map.delete(k)
    },
    map,
  }
}

function resetStore() {
  useLevelFlowStore.setState({
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
  })
}

describe('useLevelFlowStore', () => {
  let mem: ReturnType<typeof memoryLocalStorage>

  beforeEach(() => {
    mem = memoryLocalStorage()
    vi.stubGlobal('localStorage', mem)
    clearSaveFromLocalStorage()
    resetStore()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('onPuzzleSolved is idempotent for the active level', () => {
    const a = loadCatalogEntry(puzzle('lvl-a', 0))
    const b = loadCatalogEntry(puzzle('lvl-b', 2))
    useLevelFlowStore.setState({
      catalog: [a, b],
      activePuzzleId: 'lvl-a',
      activeIndex: 0,
      unlockedLevelIds: ['lvl-a'],
      solvedLevelIds: [],
    })

    useLevelFlowStore.getState().onPuzzleSolved()
    useLevelFlowStore.getState().onPuzzleSolved()

    const { solvedLevelIds, unlockedLevelIds } = useLevelFlowStore.getState()
    expect(solvedLevelIds).toEqual(['lvl-a'])
    expect(unlockedLevelIds).toEqual(['lvl-a', 'lvl-b'])
  })

  it('advanceToNextPuzzle does nothing when the next level is still locked', () => {
    const a = loadCatalogEntry(puzzle('lvl-a', 0))
    const b = loadCatalogEntry(puzzle('lvl-b', 2))
    useLevelFlowStore.setState({
      catalog: [a, b],
      activeIndex: 0,
      activePuzzleId: 'lvl-a',
      unlockedLevelIds: ['lvl-a'],
      solvedLevelIds: [],
    })

    useLevelFlowStore.getState().advanceToNextPuzzle()
    expect(useLevelFlowStore.getState().activeIndex).toBe(0)
  })

  it('bootstrapBuiltinCatalog hydrates disk and selects the saved current puzzle', () => {
    const disk: SaveFileV1 = {
      v: 1,
      unlockedLevelIds: ['beginner-meadow', 'intermediate-twist'],
      solvedLevelIds: ['beginner-meadow'],
      currentLevelId: 'intermediate-twist',
      settings: {},
    }
    writeSaveToLocalStorage(disk)

    useLevelFlowStore.getState().bootstrapBuiltinCatalog()

    const s = useLevelFlowStore.getState()
    expect(s.activePuzzleId).toBe('intermediate-twist')
    expect(s.activeIndex).toBe(1)
    expect(s.unlockedLevelIds).toContain('intermediate-twist')
    expect(s.boardNodes.length).toBeGreaterThan(0)
  })
})
