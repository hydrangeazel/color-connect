export type RenderLoopTick = {
  now: number
  deltaMs: number
}

export type RenderLoopCallback = (tick: RenderLoopTick) => void

export type RenderLoop = {
  start: () => void
  stop: () => void
  isRunning: () => boolean
}

/**
 * Imperative animation driver decoupled from React render scheduling.
 * Always pair `start` with `stop` to avoid orphaned RAF handles.
 */
export function createRenderLoop(onFrame: RenderLoopCallback): RenderLoop {
  let rafId = 0
  let running = false
  let lastTimestamp = 0

  const tick = (now: number) => {
    if (!running) return

    const deltaMs = lastTimestamp === 0 ? 0 : now - lastTimestamp
    lastTimestamp = now

    onFrame({ now, deltaMs })
    rafId = window.requestAnimationFrame(tick)
  }

  return {
    start() {
      if (running) return
      running = true
      lastTimestamp = 0
      rafId = window.requestAnimationFrame(tick)
    },
    stop() {
      running = false
      window.cancelAnimationFrame(rafId)
      rafId = 0
      lastTimestamp = 0
    },
    isRunning: () => running,
  }
}
