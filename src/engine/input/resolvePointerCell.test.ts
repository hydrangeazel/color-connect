import { describe, expect, it } from 'vitest'

import { computeBoardLayout } from '@/engine/grid/boardLayout'
import { resolvePointerCell } from '@/engine/input/resolvePointerCell'
import type { CcColorKey } from '@/lib/palette'
import type { BoardNode, GridCell } from '@/types/grid'

const layout = computeBoardLayout(400, 400)

const nodes: BoardNode[] = [
  { id: 'm:a', col: 1, row: 1, colorKey: 'moss' },
  { id: 'm:b', col: 6, row: 6, colorKey: 'moss' },
]

describe('resolvePointerCell', () => {
  it('acquires a node when pointer is in a neighboring cell but within the hit disc', () => {
    const px = layout.originX + 2.08 * layout.cellSize
    const py = layout.originY + 1.5 * layout.cellSize
    const cell = resolvePointerCell(layout, px, py, nodes, { dragging: false })
    expect(cell).toEqual({ col: 1, row: 1 })
  })

  it('does not steal interior path cells when paths are provided', () => {
    const pairByColor = {
      moss: { a: { col: 1, row: 1 }, b: { col: 6, row: 6 } },
    } as Record<CcColorKey, { a: GridCell; b: GridCell }>

    const paths = {
      moss: [
        { col: 1, row: 1 },
        { col: 2, row: 1 },
        { col: 3, row: 1 },
      ],
    }

    const x = layout.originX + (2 + 0.5) * layout.cellSize
    const y = layout.originY + (1 + 0.5) * layout.cellSize
    const cell = resolvePointerCell(layout, x, y, nodes, { paths, pairByColor })
    expect(cell).toEqual({ col: 2, row: 1 })
  })
})
