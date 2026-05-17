import { computeBoardLayout } from '@/engine/grid'
import { canvasPointToCellClamped } from '@/engine/grid/cellMapping'
import { clientToCanvasLocal } from '@/engine/input/coordinateSystem'
import { resolvePointerCell } from '@/engine/input/resolvePointerCell'
import { mountPointerSession, PRIMARY_DRAG_THRESHOLD_PX } from '@/engine/input/pointerManager'
import { useGameplayStore } from '@/game/stores/gameplayStore'
import { useInteractionStore } from '@/game/stores/interactionStore'
import type { BoardNode } from '@/types/grid'

export type InteractionMountOptions = {
  /** Prefer the canvas element so client→canvas math matches the drawing surface. */
  target: HTMLCanvasElement
  canvas: HTMLCanvasElement
  getNodes: () => readonly BoardNode[]
}

function layoutFromCanvas(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect()
  return computeBoardLayout(rect.width, rect.height)
}

/**
 * Bridges DOM pointer events to interaction + gameplay stores without React render work.
 */
export function mountInteractionController(options: InteractionMountOptions): () => void {
  const { target, canvas, getNodes } = options

  return mountPointerSession(target, {
    onPointerDown: (_event) => {
      const local = clientToCanvasLocal(canvas, event.clientX, event.clientY)
      const layout = layoutFromCanvas(canvas)
      const cell = resolvePointerCell(layout, local.x, local.y, getNodes(), {
        paths: useGameplayStore.getState().paths,
        pairByColor: useGameplayStore.getState().pairByColor,
        dragging: false,
      })
      useInteractionStore.getState().pointerDown({ pos: local, cell })
      useGameplayStore.getState().beginPointer(cell, getNodes())
    },

    onPointerMove: (_event) => {
      const local = clientToCanvasLocal(canvas, event.clientX, event.clientY)
      const layout = layoutFromCanvas(canvas)
      // Strict grid while painting: node magnet on move snaps back to the endpoint and blocks
      // orthogonal extension into the next cell.
      const cell = canvasPointToCellClamped(layout, local.x, local.y)

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

    onPointerUp: (_event) => {
      const local = clientToCanvasLocal(canvas, event.clientX, event.clientY)
      const layout = layoutFromCanvas(canvas)
      const endCell = canvasPointToCellClamped(layout, local.x, local.y)

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
