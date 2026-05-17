import { create } from 'zustand'

export type RendererStore = {
  /** Dev canvas overlay: compact HUD (off by default). */
  debugOverlay: boolean
  /** Shift+` while developing: per-cell occupancy + full diagnostics. */
  debugVerbose: boolean
  toggleDebugOverlay: () => void
  toggleDebugVerbose: () => void
}

export const useRendererStore = create<RendererStore>((set) => ({
  debugOverlay: false,
  debugVerbose: false,

  toggleDebugOverlay: () =>
    set((s) =>
      s.debugOverlay
        ? { debugOverlay: false, debugVerbose: false }
        : { debugOverlay: true, debugVerbose: false },
    ),

  toggleDebugVerbose: () =>
    set((s) => {
      if (!s.debugOverlay) {
        return { debugOverlay: true, debugVerbose: true }
      }
      return { debugVerbose: !s.debugVerbose }
    }),
}))
