import { computeBoardLayout } from '@/engine/grid'
import { useBoardStore } from '@/game/stores/boardStore'
import { useInteractionStore } from '@/game/stores/interactionStore'
import { useRendererStore } from '@/game/stores/rendererStore'
import type { FrameRenderFn } from '@/types/canvas'
import type { BoardNode } from '@/types/grid'

import { renderBackground } from './backgroundRenderer'
import { renderBoard } from './boardRenderer'
import { renderDebugOverlay } from './debugRenderer'
import { renderNodes } from './nodeRenderer'

/**
 * Single entry draw pass for the interactive board.
 * Reads interaction/renderer snapshots via `getState` to avoid React subscriptions on hot paths.
 */
export function createBoardFrameRenderer(nodes: readonly BoardNode[]): FrameRenderFn {
  let fpsSmoothed = 0

  return (context) => {
    const { cssWidth, cssHeight, now, deltaMs } = context
    const layout = computeBoardLayout(cssWidth, cssHeight)

    useBoardStore.getState().setLayout(layout)

    const interaction = useInteractionStore.getState()
    const renderer = useRendererStore.getState()

    const instFps = deltaMs > 0 ? 1000 / deltaMs : 0
    fpsSmoothed = fpsSmoothed === 0 ? instFps : fpsSmoothed * 0.9 + instFps * 0.1

    renderBackground(context)
    renderBoard(context, { layout, hoverCell: interaction.hoverCell, now })
    renderNodes(context, {
      layout,
      nodes,
      hoverCell: interaction.hoverCell,
      selectedNodeId: interaction.selectedNodeId,
      now,
    })

    if (import.meta.env.DEV && renderer.debugOverlay) {
      renderDebugOverlay(context, {
        layout,
        hoverCell: interaction.hoverCell,
        fps: fpsSmoothed,
        pointerPhase: interaction.pointerPhase,
        dragging: interaction.pointerPhase === 'dragging',
      })
    }
  }
}
