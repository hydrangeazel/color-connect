import { create } from 'zustand'

export type RendererStore = {
  /** Canvas overlay: grid indices, HUD. Toggle with ` in dev builds. */
  debugOverlay: boolean
  toggleDebugOverlay: () => void
}

export const useRendererStore = create<RendererStore>((set, get) => ({
  debugOverlay: import.meta.env.DEV,
  toggleDebugOverlay: () => set({ debugOverlay: !get().debugOverlay }),
}))
