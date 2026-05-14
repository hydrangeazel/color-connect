import type { BoardNode } from '@/types/grid'

/**
 * Hand-authored preview pairs for Phase 2 rendering + hit testing.
 * Path drawing / validation arrives in later phases.
 */
export const PHASE2_PREVIEW_NODES: BoardNode[] = [
  { id: 'pair-a-a', col: 1, row: 1, colorKey: 'moss' },
  { id: 'pair-a-b', col: 6, row: 6, colorKey: 'moss' },
  { id: 'pair-b-a', col: 6, row: 1, colorKey: 'rose' },
  { id: 'pair-b-b', col: 1, row: 6, colorKey: 'rose' },
  { id: 'pair-c-a', col: 3, row: 2, colorKey: 'beige' },
  { id: 'pair-c-b', col: 4, row: 5, colorKey: 'beige' },
  { id: 'pair-d-a', col: 2, row: 4, colorKey: 'midnight' },
  { id: 'pair-d-b', col: 5, row: 3, colorKey: 'midnight' },
]
