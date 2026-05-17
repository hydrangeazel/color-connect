import { describe, expect, it } from 'vitest'

import { computeBoardLayout } from '@/engine/grid/boardLayout'
import { canvasPointToCell, canvasPointToCellClamped } from '@/engine/grid/cellMapping'

describe('canvasPointToCellClamped', () => {
  const layout = computeBoardLayout(400, 400)

  it('returns null for canvasPointToCell when outside board but resolves after clamp', () => {
    const x = layout.originX - 50
    const y = layout.originY + layout.cellSize * 2.5
    expect(canvasPointToCell(layout, x, y)).toBeNull()
    expect(canvasPointToCellClamped(layout, x, y)).toEqual({ col: 0, row: 2 })
  })

  it('matches canvasPointToCell for interior points', () => {
    const x = layout.originX + 2.5 * layout.cellSize
    const y = layout.originY + 1.5 * layout.cellSize
    expect(canvasPointToCellClamped(layout, x, y)).toEqual(canvasPointToCell(layout, x, y))
  })
})
