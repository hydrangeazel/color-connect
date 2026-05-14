import { create } from 'zustand'

export type UIStore = {
  isHudVisible: boolean
  setHudVisible: (visible: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  isHudVisible: true,
  setHudVisible: (visible) => set({ isHudVisible: visible }),
}))
