import { canvasPointToCell, computeBoardLayout } from '@/engine/grid'
import { clientToCanvasLocal } from '@/engine/input/coordinateSystem'
import { mountPointerSession, PRIMARY_DRAG_THRESHOLD_PX } from '@/engine/input/pointerManager'
import { useInteractionStore } from '@/game/stores/interactionStore'
import type { BoardNode } from '@/types/grid'

export type InteractionMountOptions = {
  target: HTMLElement
  canvas: HTMLCanvasElement
  getNodes: () => readonly BoardNode[]
}

/**
 * Bridges DOM pointer events to the interaction store without involving React render work.
 * Drag detection uses a small Euclidean threshold in canvas CSS space.
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
    },

    onPointerMove: (event) => {
      const local = clientToCanvasLocal(canvas, event.clientX, event.clientY)
      const layout = layoutFromCanvas()
      const cell = canvasPointToCell(layout, local.x, local.y)

      useInteractionStore.getState().setPointerCanvasPos(local)
      useInteractionStore.getState().setHoverCell(cell)
      useInteractionStore.getState().pointerMove({ pos: local })

      const state = useInteractionStore.getState()
      if (state.pointerPhase !== 'pressed') return

      const origin = state.pressStartPx
      if (!origin) return

      const dx = local.x - origin.x
      const dy = local.y - origin.y
      if (dx * dx + dy * dy > PRIMARY_DRAG_THRESHOLD_PX * PRIMARY_DRAG_THRESHOLD_PX) {
        useInteractionStore.getState().promoteToDrag()
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
    },

    onPointerCancel: () => {
      useInteractionStore.getState().pointerCancel()
    },
  })
}
