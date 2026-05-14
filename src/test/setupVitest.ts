/**
 * Node test environment polyfills for code paths that assume a browser scheduler.
 */
if (typeof globalThis.requestAnimationFrame !== 'function') {
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback): number => {
    cb(0)
    return 0
  }
}
