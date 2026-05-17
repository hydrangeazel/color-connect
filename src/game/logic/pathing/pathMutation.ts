import { isPairPathComplete } from '@/game/logic/completion/pairCompletion'
import type { CcColorKey } from '@/lib/palette'
import { colorKeyToOccupancyIndex, occupancyIndexToColorKey } from '@/lib/colorCodec'
import { cellToIndex, cellsEqual, manhattan } from '@/game/logic/pathing/cellMath'
import { writeOccupancyMap, type PathsState } from '@/game/logic/pathing/occupation'
import { isWithinGrid } from '@/game/logic/validation/bounds'
import type { GridCell } from '@/types/grid'

/** Endpoint map from the puzzle (same shape as gameplay `pairByColor`). */
export type PairEndpointsByColor = Readonly<
  Partial<Record<CcColorKey, { a: GridCell; b: GridCell }>>
>

/** True if `cell` is a dot belonging to another color (Flow: paths may not cross other dots). */
export function isForeignEndpointCell(
  cell: GridCell,
  color: CcColorKey,
  pairByColor: PairEndpointsByColor,
): boolean {
  for (const key of Object.keys(pairByColor) as CcColorKey[]) {
    if (key === color) continue
    const p = pairByColor[key]
    if (!p) continue
    if (cellsEqual(cell, p.a) || cellsEqual(cell, p.b)) return true
  }
  return false
}

export type PathStepLint =
  | 'noop'
  | 'backstep'
  | 'truncate'
  | 'extend'
  | 'sever_extend'
  | 'blocked'

export type PathHoverStepResult = {
  nextPath: GridCell[]
  changed: boolean
  lint: PathStepLint
  /** Other colors whose paths were trimmed so `color` could extend into `hover`. */
  coercedTruncations?: Partial<PathsState>
}

/**
 * Flow-style grid path step for a single color while the player is painting.
 * Pure + deterministic: callers own path copies and scratch buffers.
 */
export function applyHoverPathStep(
  paths: PathsState,
  color: CcColorKey,
  hover: GridCell,
  lastApplied: GridCell | null,
  scratchOcc: Uint8Array,
  pairByColor: PairEndpointsByColor,
): PathHoverStepResult {
  if (!isWithinGrid(hover)) {
    const cur = [...(paths[color] ?? [])]
    return { nextPath: cur, changed: false, lint: 'noop' }
  }

  if (lastApplied && cellsEqual(lastApplied, hover)) {
    const cur = [...(paths[color] ?? [])]
    return { nextPath: cur, changed: false, lint: 'noop' }
  }

  const path = [...(paths[color] ?? [])]
  if (path.length === 0) {
    return { nextPath: path, changed: false, lint: 'noop' }
  }

  const tail = path[path.length - 1]

  if (cellsEqual(hover, tail)) {
    return { nextPath: path, changed: false, lint: 'noop' }
  }

  if (path.length >= 2 && cellsEqual(hover, path[path.length - 2])) {
    path.pop()
    return { nextPath: path, changed: true, lint: 'backstep' }
  }

  for (let i = 0; i < path.length - 1; i += 1) {
    if (cellsEqual(path[i], hover)) {
      return { nextPath: path.slice(0, i + 1), changed: true, lint: 'truncate' }
    }
  }

  if (manhattan(hover, tail) !== 1) {
    return { nextPath: path, changed: false, lint: 'noop' }
  }

  const pair = pairByColor[color]
  if (pair && isPairPathComplete(path, pair.a, pair.b)) {
    return { nextPath: path, changed: false, lint: 'blocked' }
  }

  writeOccupancyMap(paths, scratchOcc)
  const hoverIdx = cellToIndex(hover)
  const owner = scratchOcc[hoverIdx]
  const selfIdx = colorKeyToOccupancyIndex(color)

  if (owner !== 0 && owner !== selfIdx) {
    const otherColor = occupancyIndexToColorKey(owner)
    if (!otherColor) {
      return { nextPath: path, changed: false, lint: 'blocked' }
    }
    const otherPath = paths[otherColor] ?? []
    const cutAt = otherPath.findIndex((c) => cellsEqual(c, hover))
    if (cutAt < 0) {
      return { nextPath: path, changed: false, lint: 'blocked' }
    }
    const severed = otherPath.slice(0, cutAt)
    path.push(hover)
    return {
      nextPath: path,
      changed: true,
      lint: 'sever_extend',
      coercedTruncations: { [otherColor]: severed },
    }
  }

  if (owner === 0 && isForeignEndpointCell(hover, color, pairByColor)) {
    return { nextPath: path, changed: false, lint: 'blocked' }
  }

  path.push(hover)
  return { nextPath: path, changed: true, lint: 'extend' }
}
