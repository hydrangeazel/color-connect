import { canvasPointToCell, computeBoardLayout } from '@/engine/grid'
import { clientToCanvasLocal } from '@/engine/input/coordinateSystem'
import { mountPointerSession, PRIMARY_DRAG_THRESHOLD_PX } from '@/engine/input/pointerManager'
import { useGameplayStore } from '@/game/stores/gameplayStore'
import { useInteractionStore } from '@/game/stores/interactionStore'
import type { BoardNode } from '@/types/grid'

export type InteractionMountOptions = {
  target: HTMLElement
  canvas: HTMLCanvasElement
  getNodes: () => readonly BoardNode[]
}

/**
 * Bridges DOM pointer events to interaction + gameplay stores without React render work.
 */
export function mountInteractionController(options: InteractionMountOptions): () => void {
  const { target, canvas, getNodes } = options

  const layoutFromCanvas = () => {
    const rect = canvas.getBoundingClientRect()
    return computeBoardLayout(rect.width, rect.height)
  }

  return mountPointerSession(target, {
    onPointerDown: (event) => {
      const local = clientToCanvasLocal(canvas, event.clientX, event.clientY)
      const layout = layoutFromCanvas()
      const cell = canvasPointToCell(layout, local.x, local.y)
      useInteractionStore.getState().pointerDown({ pos: local, cell })
      useGameplayStore.getState().beginPointer(cell, getNodes())
    },

    onPointerMove: (event) => {
      const local = clientToCanvasLocal(canvas, event.clientX, event.clientY)
      const layout = layoutFromCanvas()
      const cell = canvasPointToCell(layout, local.x, local.y)

      useInteractionStore.getState().setPointerCanvasPos(local)
      useInteractionStore.getState().setHoverCell(cell)
      useInteractionStore.getState().pointerMove({ pos: local })

      const afterMove = useInteractionStore.getState()
      const origin = afterMove.pressStartPx
      if (afterMove.pointerPhase === 'pressed' && origin) {
        const dx = local.x - origin.x
        const dy = local.y - origin.y
        if (dx * dx + dy * dy > PRIMARY_DRAG_THRESHOLD_PX * PRIMARY_DRAG_THRESHOLD_PX) {
          useInteractionStore.getState().promoteToDrag()
        }
      }

      const phase = useInteractionStore.getState().pointerPhase
      if (phase === 'pressed' || phase === 'dragging') {
        useGameplayStore.getState().applyHoverDuringSession(cell)
      }
    },

    onPointerUp: (event) => {
      const local = clientToCanvasLocal(canvas, event.clientX, event.clientY)
      const layout = layoutFromCanvas()
      const endCell = canvasPointToCell(layout, local.x, local.y)

      const state = useInteractionStore.getState()
      const dragged = state.pointerPhase === 'dragging'

      useInteractionStore.getState().setPointerCanvasPos(local)
      useInteractionStore.getState().pointerUp({
        dragged,
        endCell,
        nodes: getNodes(),
      })
      useGameplayStore.getState().endPointerSession()
    },

    onPointerCancel: () => {
      useGameplayStore.getState().endPointerSession()
      useInteractionStore.getState().pointerCancel()
    },
  })
}
