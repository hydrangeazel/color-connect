import { create } from 'zustand'

export type GameLifecyclePhase = 'boot' | 'ready'

export type GameStore = {
  phase: GameLifecyclePhase
  setPhase: (phase: GameLifecyclePhase) => void
}

export const useGameStore = create<GameStore>((set) => ({
  phase: 'boot',
  setPhase: (phase) => set({ phase }),
}))
