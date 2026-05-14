import { create } from 'zustand'

export type SettingsStore = {
  prefersReducedMotion: boolean
  setPrefersReducedMotion: (value: boolean) => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  prefersReducedMotion: false,
  setPrefersReducedMotion: (value) => set({ prefersReducedMotion: value }),
}))
