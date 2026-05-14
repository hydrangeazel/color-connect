import { describe, expect, it } from 'vitest'

import { loadCatalogEntry } from '@/game/levels/loaders/puzzleLoader'
import { hydrateProgress } from '@/game/levels/persistence/hydrateProgress'
import type { PuzzleRecordV1 } from '@/game/levels/schemas/puzzleRecord'

function puzzle(id: string, pairOffset = 0): PuzzleRecordV1 {
  const c0 = pairOffset
  const c1 = pairOffset + 1
  return {
    version: 1,
    id,
    title: id,
    size: 8,
    difficulty: 'beginner',
    palette: 'cozy-default',
    pairs: [
      { color: 'moss', a: { col: c0, row: 0 }, b: { col: c1, row: 0 } },
      { color: 'rose', a: { col: c0, row: 1 }, b: { col: c1, row: 1 } },
    ],
  }
}

describe('hydrateProgress', () => {
  it('returns empty save when catalog is empty', () => {
    const { save, startIndex } = hydrateProgress(null, [])
    expect(startIndex).toBe(0)
    expect(save.currentLevelId).toBe('missing')
    expect(save.unlockedLevelIds).toEqual(['missing'])
  })

  it('creates fresh save when disk is null', () => {
    const catalog = [loadCatalogEntry(puzzle('a', 0)), loadCatalogEntry(puzzle('b', 2))]
    const { save, startIndex } = hydrateProgress(null, catalog)
    expect(startIndex).toBe(0)
    expect(save.currentLevelId).toBe('a')
    expect(save.unlockedLevelIds).toEqual(['a'])
    expect(save.solvedLevelIds).toEqual([])
  })

  it('filters unknown ids and preserves first puzzle unlock', () => {
    const catalog = [loadCatalogEntry(puzzle('a', 0)), loadCatalogEntry(puzzle('b', 2))]
    const disk = {
      v: 1 as const,
      unlockedLevelIds: ['ghost', 'a'],
      solvedLevelIds: ['ghost', 'a'],
      currentLevelId: 'ghost' as string | null,
      settings: {},
    }
    const { save, startIndex } = hydrateProgress(disk, catalog)
    expect(save.unlockedLevelIds).toContain('a')
    expect(save.unlockedLevelIds).not.toContain('ghost')
    expect(save.solvedLevelIds).toEqual(['a'])
    expect(save.currentLevelId).toBe('a')
    expect(startIndex).toBe(0)
  })

  it('resolves start index from valid current level id', () => {
    const catalog = [loadCatalogEntry(puzzle('a', 0)), loadCatalogEntry(puzzle('b', 2))]
    const disk = {
      v: 1 as const,
      unlockedLevelIds: ['a', 'b'],
      solvedLevelIds: [],
      currentLevelId: 'b',
      settings: {},
    }
    const { save, startIndex } = hydrateProgress(disk, catalog)
    expect(save.currentLevelId).toBe('b')
    expect(startIndex).toBe(1)
  })
})
