import type { BoardLayout } from '@/engine/grid/boardLayout'
import { cellToCanvasCenter } from '@/engine/grid/cellMapping'
import { CC_PALETTE } from '@/lib/palette'
import type { FrameRenderContext } from '@/types/canvas'
import type { BoardNode, GridCell } from '@/types/grid'

export type NodeRenderOptions = {
  layout: BoardLayout
  nodes: readonly BoardNode[]
  hoverCell: GridCell | null
  selectedNodeId: string | null
  now: number
  solved?: boolean
  solvedAtMs?: number | null
}

export function renderNodes(context: FrameRenderContext, options: NodeRenderOptions): void {
  const { ctx } = context
  const { layout, nodes, hoverCell, selectedNodeId, now, solved, solvedAtMs } = options

  for (const node of nodes) {
    const { x, y } = cellToCanvasCenter(layout, node)
    const isHovered = hoverCell?.col === node.col && hoverCell?.row === node.row
    const isSelected = node.id === selectedNodeId
    const winPulse =
      solved && solvedAtMs != null
        ? 1 + Math.sin((now - solvedAtMs) * 0.0045) * 0.05
        : solved
          ? 1.03
          : 1
    const hoverPulse = isHovered ? 1 + Math.sin(now * 0.01) * 0.06 : 1
    const radius = layout.cellSize * 0.28 * hoverPulse * winPulse
    const color = CC_PALETTE[node.colorKey]

    ctx.save()
    ctx.shadowColor = color
    ctx.shadowBlur = isHovered ? 22 : 14
    ctx.fillStyle = color
    ctx.strokeStyle = 'rgba(247, 244, 213, 0.35)'
    ctx.lineWidth = isSelected ? 2.2 : 1.2

    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Inner highlight
    const inner = ctx.createRadialGradient(
      x - radius * 0.25,
      y - radius * 0.35,
      radius * 0.1,
      x,
      y,
      radius,
    )
    inner.addColorStop(0, 'rgba(255, 255, 255, 0.35)')
    inner.addColorStop(0.35, 'rgba(255, 255, 255, 0)')
    inner.addColorStop(1, 'rgba(0, 0, 0, 0.25)')
    ctx.globalCompositeOperation = 'screen'
    ctx.fillStyle = inner
    ctx.beginPath()
    ctx.arc(x, y, radius * 0.95, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }
}
