import { describe, expect, it } from 'vitest'

import {
  boardNodesFromPuzzle,
  clonePuzzleRecord,
  parseUnknownPuzzlePayload,
} from '@/game/levels/loaders/puzzleLoader'
import type { PuzzleRecordV1 } from '@/game/levels/schemas/puzzleRecord'

const sample: PuzzleRecordV1 = {
  version: 1,
  id: 'sample',
  title: 'Sample',
  size: 8,
  difficulty: 'intermediate',
  palette: 'cozy-default',
  pairs: [
    { color: 'moss', a: { col: 0, row: 0 }, b: { col: 7, row: 7 } },
    { color: 'beige', a: { col: 2, row: 2 }, b: { col: 5, row: 5 } },
  ],
  metadata: { seed: 42 },
}

describe('puzzleLoader', () => {
  it('maps pairs to deterministic node ids', () => {
    const nodes = boardNodesFromPuzzle(sample)
    expect(nodes).toHaveLength(4)
    expect(nodes[0]).toMatchObject({ id: 'sample:moss:a', col: 0, row: 0, colorKey: 'moss' })
    expect(nodes[1]).toMatchObject({ id: 'sample:moss:b', col: 7, row: 7, colorKey: 'moss' })
  })

  it('clonePuzzleRecord deep-copies pairs and metadata', () => {
    const clone = clonePuzzleRecord(sample)
    expect(clone).not.toBe(sample)
    expect(clone.pairs).not.toBe(sample.pairs)
    expect(clone.pairs[0]).not.toBe(sample.pairs[0])
    clone.pairs[0]!.a.col = 99
    expect(sample.pairs[0]!.a.col).toBe(0)
    expect(clone.metadata).not.toBe(sample.metadata)
  })

  it('parseUnknownPuzzlePayload returns null for invalid payloads', () => {
    expect(parseUnknownPuzzlePayload({})).toBeNull()
    expect(parseUnknownPuzzlePayload('nope')).toBeNull()
  })

  it('parseUnknownPuzzlePayload loads valid JSON-shaped records', () => {
    const loaded = parseUnknownPuzzlePayload(sample)
    expect(loaded).not.toBeNull()
    expect(loaded?.id).toBe('sample')
    expect(loaded?.nodes).toHaveLength(4)
  })
})
