/**
 * Maps viewport client coordinates to the canvas's **CSS layout** coordinate space.
 * Must match the same space used by `ctx.setTransform(dpr,…)` drawing (logical pixels).
 */
export function clientToCanvasLocal(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect()
  const w = rect.width
  const h = rect.height
  const x = clientX - rect.left
  const y = clientY - rect.top
  // Clamp so border / sub-pixel misses still map to the nearest drawable pixel.
  return {
    x: Math.min(Math.max(x, 0), Math.max(w, 1e-6)),
    y: Math.min(Math.max(y, 0), Math.max(h, 1e-6)),
  }
}
