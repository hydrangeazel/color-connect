import type { CcColorKey } from '@/lib/palette'
import type { BoardNode, GridCell } from '@/types/grid'

/** One pair per puzzle color (exactly two endpoints). */
export type ColorPair = {
  color: CcColorKey
  a: GridCell
  b: GridCell
}

export type PuzzleDefinition = {
  pairs: readonly ColorPair[]
  nodes: readonly BoardNode[]
}

export function buildPuzzleFromNodes(nodes: readonly BoardNode[]): PuzzleDefinition {
  const byColor = new Map<CcColorKey, BoardNode[]>()
  for (const n of nodes) {
    const list = byColor.get(n.colorKey) ?? []
    list.push(n)
    byColor.set(n.colorKey, list)
  }

  const pairs: ColorPair[] = []
  for (const [color, list] of byColor) {
    if (list.length !== 2) {
      throw new Error(`Expected exactly 2 nodes for color ${color}, got ${list.length}`)
    }
    pairs.push({
      color,
      a: { col: list[0].col, row: list[0].row },
      b: { col: list[1].col, row: list[1].row },
    })
  }

  return { pairs, nodes }
}

export function pairEndpointsRecord(
  pairs: readonly ColorPair[],
): Record<CcColorKey, { a: GridCell; b: GridCell }> {
  const out = {} as Record<CcColorKey, { a: GridCell; b: GridCell }>
  for (const p of pairs) {
    out[p.color] = { a: p.a, b: p.b }
  }
  return out
}
