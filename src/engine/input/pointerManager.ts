export const PRIMARY_DRAG_THRESHOLD_PX = 6

export type PointerSessionHandlers = {
  onPointerDown: (event: PointerEvent) => void
  onPointerMove: (event: PointerEvent) => void
  onPointerUp: (event: PointerEvent) => void
  onPointerCancel: (event: PointerEvent) => void
}

/**
 * Normalized pointer session using the Pointer Events API (mouse + touch + pen).
 * Capture is scoped to the mount target to keep drag streams coherent when leaving the canvas.
 */
export function mountPointerSession(
  target: HTMLElement,
  handlers: PointerSessionHandlers,
): () => void {
  const onPointerDown = (event: PointerEvent) => {
    if (!isPrimaryIntent(event)) return
    target.setPointerCapture(event.pointerId)
    handlers.onPointerDown(event)
  }

  const onPointerMove = (event: PointerEvent) => {
    handlers.onPointerMove(event)
  }

  const releasePointer = (event: PointerEvent) => {
    if (!target.hasPointerCapture(event.pointerId)) return
    target.releasePointerCapture(event.pointerId)
  }

  const onPointerUp = (event: PointerEvent) => {
    handlers.onPointerUp(event)
    releasePointer(event)
  }

  const onPointerCancel = (event: PointerEvent) => {
    handlers.onPointerCancel(event)
    releasePointer(event)
  }

  target.addEventListener('pointerdown', onPointerDown)
  target.addEventListener('pointermove', onPointerMove)
  target.addEventListener('pointerup', onPointerUp)
  target.addEventListener('pointercancel', onPointerCancel)

  return () => {
    target.removeEventListener('pointerdown', onPointerDown)
    target.removeEventListener('pointermove', onPointerMove)
    target.removeEventListener('pointerup', onPointerUp)
    target.removeEventListener('pointercancel', onPointerCancel)
  }
}

function isPrimaryIntent(event: PointerEvent): boolean {
  if (event.pointerType === 'mouse') return event.button === 0
  return true
}
