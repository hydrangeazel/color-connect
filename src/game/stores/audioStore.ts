import { create } from 'zustand'

export type AudioStore = {
  masterVolume: number
  muted: boolean
  setMasterVolume: (volume: number) => void
  setMuted: (muted: boolean) => void
}

export const useAudioStore = create<AudioStore>((set) => ({
  masterVolume: 0.8,
  muted: false,
  setMasterVolume: (volume) => set({ masterVolume: Math.min(1, Math.max(0, volume)) }),
  setMuted: (muted) => set({ muted }),
}))
