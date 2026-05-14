import type { BoardNode } from '@/types/grid'
import type { CatalogEntry, PuzzleRecordV1 } from '@/game/levels/schemas/puzzleRecord'
import { validatePuzzleRecord } from '@/game/levels/validation/puzzleValidator'

export type LoadedPuzzle = CatalogEntry & {
  nodes: BoardNode[]
}

/**
 * Deterministic mapping from catalog pairs to runtime nodes used by the engine.
 */
export function boardNodesFromPuzzle(record: PuzzleRecordV1): BoardNode[] {
  const nodes: BoardNode[] = []
  for (const pair of record.pairs) {
    nodes.push(
      {
        id: `${record.id}:${pair.color}:a`,
        col: pair.a.col,
        row: pair.a.row,
        colorKey: pair.color,
      },
      {
        id: `${record.id}:${pair.color}:b`,
        col: pair.b.col,
        row: pair.b.row,
        colorKey: pair.color,
      },
    )
  }
  return nodes
}

export function clonePuzzleRecord(record: PuzzleRecordV1): PuzzleRecordV1 {
  return {
    ...record,
    pairs: record.pairs.map((p) => ({
      color: p.color,
      a: { col: p.a.col, row: p.a.row },
      b: { col: p.b.col, row: p.b.row },
    })),
    metadata: record.metadata ? { ...record.metadata } : undefined,
  }
}

export function loadCatalogEntry(record: PuzzleRecordV1): LoadedPuzzle {
  return {
    id: record.id,
    record,
    nodes: boardNodesFromPuzzle(record),
  }
}

export function parseUnknownPuzzlePayload(raw: unknown): LoadedPuzzle | null {
  const res = validatePuzzleRecord(raw)
  if (!res.ok) return null
  return loadCatalogEntry(res.value)
}

export function assertValidPuzzlePayload(raw: unknown): LoadedPuzzle {
  const res = validatePuzzleRecord(raw)
  if (!res.ok) {
    const detail = res.issues.map((i) => `${i.path}: ${i.message}`).join('; ')
    throw new Error(`Invalid puzzle: ${detail}`)
  }
  return loadCatalogEntry(res.value)
}
