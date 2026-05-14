import type { CcColorKey } from '@/lib/palette'

const COLOR_TO_IDX: Record<CcColorKey, number> = {
  moss: 1,
  rose: 2,
  beige: 3,
  midnight: 4,
  forest: 5,
}

export function colorKeyToOccupancyIndex(color: CcColorKey): number {
  return COLOR_TO_IDX[color] ?? 0
}
