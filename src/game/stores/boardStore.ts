import { create } from 'zustand'

import { layoutsEqual, type BoardLayout } from '@/engine/grid'

export type BoardStore = {
  layout: BoardLayout | null
  setLayout: (layout: BoardLayout | null) => void
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  layout: null,
  setLayout: (layout) => {
    const current = get().layout
    if (layoutsEqual(current, layout)) return
    set({ layout })
  },
}))
