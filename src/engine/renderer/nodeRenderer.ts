import type { BoardLayout } from '@/engine/grid/boardLayout'
import { cellToCanvasCenter } from '@/engine/grid/cellMapping'
import { NODE_VISUAL_RADIUS_CELL } from '@/engine/input/nodeHitConstants'
import { CC_PALETTE, type CcColorKey } from '@/lib/palette'
import type { FrameRenderContext } from '@/types/canvas'
import type { BoardNode, GridCell } from '@/types/grid'

export type NodeRenderOptions = {
  layout: BoardLayout
  nodes: readonly BoardNode[]
  hoverCell: GridCell | null
  selectedNodeId: string | null
  sessionColor: CcColorKey | null
  dragging: boolean
  now: number
  solved?: boolean
  solvedAtMs?: number | null
}

export function renderNodes(context: FrameRenderContext, options: NodeRenderOptions): void {
  const { ctx } = context
  const {
    layout,
    nodes,
    hoverCell,
    selectedNodeId,
    sessionColor,
    dragging,
    now,
    solved,
    solvedAtMs,
  } = options

  const baseRadius = layout.cellSize * NODE_VISUAL_RADIUS_CELL

  for (const node of nodes) {
    const { x, y } = cellToCanvasCenter(layout, node)
    const isHovered = hoverCell?.col === node.col && hoverCell?.row === node.row
    const isSelected = node.id === selectedNodeId
    const isSessionColor = sessionColor === node.colorKey
    const dragBoost = dragging && isSessionColor ? 1.08 : 1

    const winPulse =
      solved && solvedAtMs != null
        ? 1 + Math.sin((now - solvedAtMs) * 0.0038) * 0.06
        : solved
          ? 1.04
          : 1
    const hoverBoost = isHovered ? 1.1 : 1
    const radius = baseRadius * hoverBoost * dragBoost * winPulse
    const color = CC_PALETTE[node.colorKey]

    const glow = isHovered ? 34 : isSelected ? 28 : isSessionColor && dragging ? 32 : 20
    const ring = isHovered ? 2.6 : isSelected ? 2.2 : 1.65
    const ringAlpha = isHovered ? 0.72 : isSelected ? 0.55 : 0.42

    ctx.save()
    ctx.shadowColor = color
    ctx.shadowBlur = glow
    ctx.fillStyle = color
    ctx.strokeStyle = `rgba(247, 244, 213, ${ringAlpha})`
    ctx.lineWidth = ring

    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Crisp rim for readability on dark grid
    ctx.shadowBlur = 0
    ctx.strokeStyle = 'rgba(10, 51, 35, 0.55)'
    ctx.lineWidth = Math.max(1, layout.cellSize * 0.035)
    ctx.stroke()

    const inner = ctx.createRadialGradient(
      x - radius * 0.25,
      y - radius * 0.38,
      radius * 0.08,
      x,
      y,
      radius,
    )
    inner.addColorStop(0, 'rgba(255, 255, 255, 0.42)')
    inner.addColorStop(0.32, 'rgba(255, 255, 255, 0.08)')
    inner.addColorStop(1, 'rgba(0, 0, 0, 0.22)')
    ctx.globalCompositeOperation = 'screen'
    ctx.fillStyle = inner
    ctx.beginPath()
    ctx.arc(x, y, radius * 0.92, 0, Math.PI * 2)
    ctx.fill()

    if (dragging && isSessionColor) {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = `rgba(247, 244, 213, ${0.35 + Math.sin(now * 0.018) * 0.12})`
      ctx.lineWidth = 2
      ctx.setLineDash([layout.cellSize * 0.1, layout.cellSize * 0.08])
      ctx.beginPath()
      ctx.arc(x, y, radius + layout.cellSize * 0.06, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
    }

    ctx.restore()
  }
}
