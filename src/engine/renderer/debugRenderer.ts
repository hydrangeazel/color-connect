import type { BoardLayout } from '@/engine/grid/boardLayout'
import { cellToCanvasCenter } from '@/engine/grid/cellMapping'
import { writeOccupancyMap, type PathsState } from '@/game/logic/pathing/occupation'
import type { PathStepLint } from '@/game/logic/pathing/pathMutation'
import type { LevelTransition } from '@/game/levels/progression/levelFlowStore'
import type { CcColorKey } from '@/lib/palette'
import type { FrameRenderContext } from '@/types/canvas'
import { NODE_HIT_RADIUS_DRAG_CELL } from '@/engine/input/nodeHitConstants'
import type { BoardNode, GridCell } from '@/types/grid'

export type GameplayDebugView = {
  paths: PathsState
  sessionColor: CcColorKey | null
  solved: boolean
  lastPathLint: PathStepLint | 'idle'
  pairByColor: Record<CcColorKey, { a: GridCell; b: GridCell }>
}

export type LevelDebugView = {
  puzzleId: string | null
  title: string
  difficulty: string
  transition: LevelTransition
  activeIndex: number
  catalogLen: number
  unlocked: number
  solvedProgress: number
  levelStartedAt: number | null
  elapsedMs: number | null
}

export type GenerationDebugView = {
  seed: string | null
  target: string | null
  isGenerating: boolean
  genMs: number | null
  score: number | null
  classified: string | null
  occupancy: number | null
  meanTurns: number | null
  junction: number | null
  error: string | null
}

export type DebugRenderOptions = {
  layout: BoardLayout
  hoverCell: GridCell | null
  fps: number
  pointerPhase: string
  dragging: boolean
  gameplay: GameplayDebugView
  level: LevelDebugView
  generation: GenerationDebugView | null
  /** Shift+` mode: per-cell labels + full telemetry. */
  verbose: boolean
  /** Verbose-only: node acquisition discs + pointer probe. */
  nodes?: readonly BoardNode[]
  pointerCss?: { x: number; y: number } | null
}

const occScratch = new Uint8Array(64)

export function renderDebugOverlay(context: FrameRenderContext, options: DebugRenderOptions): void {
  const { ctx } = context
  const {
    layout,
    hoverCell,
    fps,
    pointerPhase,
    dragging,
    gameplay,
    level,
    generation,
    verbose,
    nodes: debugNodes,
    pointerCss,
  } = options

  ctx.save()
  const fontPx = verbose ? 10 : 9
  ctx.font = `${fontPx}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace`
  ctx.fillStyle = verbose ? 'rgba(247, 244, 213, 0.78)' : 'rgba(247, 244, 213, 0.62)'
  ctx.strokeStyle = 'rgba(10, 51, 35, 0.75)'
  ctx.lineWidth = 2

  const pathCells = gameplay.sessionColor ? (gameplay.paths[gameplay.sessionColor]?.length ?? 0) : 0

  const compactLines = [
    `fps ${fps.toFixed(0)} · ${pointerPhase}${dragging ? '·drag' : ''}`,
    hoverCell ? `cell ${hoverCell.col},${hoverCell.row}` : 'cell —',
    `lint ${gameplay.lastPathLint} · len ${pathCells}`,
    `${level.puzzleId ?? 'puzzle'} · ${gameplay.solved ? 'solved' : 'play'}`,
  ]

  const verboseLines = verbose
    ? [
        ...compactLines,
        `session ${gameplay.sessionColor ?? '—'}`,
        `${level.title} · ${level.difficulty}`,
        `flow ${level.transition} · ${level.activeIndex + 1}/${level.catalogLen}`,
        `prog u${level.unlocked} s${level.solvedProgress}`,
        level.elapsedMs != null ? `lv ${(level.elapsedMs / 1000).toFixed(1)}s` : 'lv —',
        ...(generation
          ? [
              `gen ${generation.seed ?? '—'} / ${generation.target ?? '—'}`,
              generation.isGenerating
                ? 'gen…'
                : `g ${generation.genMs != null ? `${generation.genMs.toFixed(0)}ms` : '—'} sc ${generation.score != null ? generation.score.toFixed(0) : '—'}`,
              `cls ${generation.classified ?? '—'} occ ${generation.occupancy != null ? `${(generation.occupancy * 100).toFixed(0)}%` : '—'}`,
              `j ${generation.junction ?? '—'}${generation.error ? ` err ${generation.error}` : ''}`,
            ]
          : []),
      ]
    : compactLines

  const lineHeight = verbose ? 12 : 11
  let y = 14
  for (const line of verboseLines) {
    ctx.strokeText(line, 10, y)
    ctx.fillText(line, 10, y)
    y += lineHeight
  }

  if (verbose && debugNodes?.length && pointerCss) {
    const { x: px, y: py } = pointerCss
    const rHit = layout.cellSize * NODE_HIT_RADIUS_DRAG_CELL
    ctx.save()
    ctx.setLineDash([5, 4])
    for (const node of debugNodes) {
      const c = cellToCanvasCenter(layout, node)
      ctx.beginPath()
      ctx.arc(c.x, c.y, rHit, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(211, 150, 140, 0.5)'
      ctx.lineWidth = 1
      ctx.stroke()
    }
    ctx.setLineDash([])
    ctx.strokeStyle = 'rgba(247, 244, 213, 0.95)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(px - 12, py)
    ctx.lineTo(px + 12, py)
    ctx.moveTo(px, py - 12)
    ctx.lineTo(px, py + 12)
    ctx.stroke()
    ctx.fillStyle = 'rgba(247, 244, 213, 0.95)'
    ctx.beginPath()
    ctx.arc(px, py, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  if (!verbose) {
    ctx.restore()
    return
  }

  writeOccupancyMap(gameplay.paths, occScratch)

  ctx.translate(layout.originX, layout.originY)
  ctx.font = '8px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
  for (let row = 0; row < layout.gridSize; row += 1) {
    for (let col = 0; col < layout.gridSize; col += 1) {
      const { x, y: cy } = cellToCanvasCenter(layout, { col, row })
      const lx = x - layout.originX
      const ly = cy - layout.originY
      const occ = occScratch[row * layout.gridSize + col]
      const label = `${col},${row}`
      ctx.strokeStyle = 'rgba(10, 51, 35, 0.45)'
      ctx.lineWidth = 1.5
      ctx.strokeText(label, lx, ly + 2)
      ctx.fillStyle = 'rgba(247, 244, 213, 0.28)'
      ctx.fillText(label, lx, ly + 2)

      if (occ > 0) {
        ctx.fillStyle = 'rgba(131, 153, 88, 0.75)'
        ctx.fillText(String(occ), lx + layout.cellSize * 0.2, ly - layout.cellSize * 0.2)
      }
    }
  }

  ctx.restore()
}
