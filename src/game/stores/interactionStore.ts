import { create } from 'zustand'

import type { BoardNode, GridCell } from '@/types/grid'
import type { PointerPhase } from '@/types/pointer'
import type { Vec2 } from '@/types/pointer'

export type InteractionSnapshot = {
  pointerPhase: PointerPhase
  hoverCell: GridCell | null
  pointerCanvasPos: Vec2 | null
  pressStartPx: Vec2 | null
  pressStartCell: GridCell | null
  selectedNodeId: string | null
}

type InteractionStore = InteractionSnapshot & {
  setHoverCell: (cell: GridCell | null) => void
  setPointerCanvasPos: (pos: Vec2 | null) => void
  pointerDown: (args: { pos: Vec2; cell: GridCell | null }) => void
  pointerMove: (args: { pos: Vec2 }) => void
  promoteToDrag: () => void
  pointerUp: (args: {
    dragged: boolean
    endCell: GridCell | null
    nodes: readonly BoardNode[]
  }) => void
  pointerCancel: () => void
  clearSelection: () => void
}

const idlePress = {
  pointerPhase: 'idle' as const,
  pressStartPx: null as Vec2 | null,
  pressStartCell: null as GridCell | null,
}

export const useInteractionStore = create<InteractionStore>((set, get) => ({
  pointerPhase: 'idle',
  hoverCell: null,
  pointerCanvasPos: null,
  pressStartPx: null,
  pressStartCell: null,
  selectedNodeId: null,

  setHoverCell: (hoverCell) => set({ hoverCell }),

  setPointerCanvasPos: (pointerCanvasPos) => set({ pointerCanvasPos }),

  pointerDown: ({ pos, cell }) =>
    set({
      pointerPhase: 'pressed',
      pressStartPx: pos,
      pressStartCell: cell,
      pointerCanvasPos: pos,
      hoverCell: cell ?? get().hoverCell,
    }),

  pointerMove: ({ pos }) => {
    set({ pointerCanvasPos: pos })
  },

  promoteToDrag: () =>
    set((state) => (state.pointerPhase === 'pressed' ? { pointerPhase: 'dragging' } : {})),

  pointerUp: ({ dragged, endCell, nodes }) => {
    if (!dragged) {
      const node = endCell
        ? nodes.find((n) => n.col === endCell.col && n.row === endCell.row)
        : null
      set({
        ...idlePress,
        pointerCanvasPos: get().pointerCanvasPos,
        selectedNodeId: node?.id ?? null,
      })
      return
    }

    set({
      ...idlePress,
      pointerCanvasPos: get().pointerCanvasPos,
    })
  },

  pointerCancel: () =>
    set({
      ...idlePress,
    }),

  clearSelection: () => set({ selectedNodeId: null }),
}))
