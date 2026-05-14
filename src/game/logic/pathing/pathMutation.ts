import type { CcColorKey } from '@/lib/palette'
import { colorKeyToOccupancyIndex } from '@/lib/colorCodec'
import { cellToIndex, cellsEqual, manhattan } from '@/game/logic/pathing/cellMath'
import { writeOccupancyMap, type PathsState } from '@/game/logic/pathing/occupation'
import { isWithinGrid } from '@/game/logic/validation/bounds'
import type { GridCell } from '@/types/grid'

export type PathStepLint = 'noop' | 'backstep' | 'truncate' | 'extend' | 'blocked'

export type PathHoverStepResult = {
  nextPath: GridCell[]
  changed: boolean
  lint: PathStepLint
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

  writeOccupancyMap(paths, scratchOcc)
  const hoverIdx = cellToIndex(hover)
  const owner = scratchOcc[hoverIdx]
  const selfIdx = colorKeyToOccupancyIndex(color)

  if (owner !== 0 && owner !== selfIdx) {
    return { nextPath: path, changed: false, lint: 'blocked' }
  }

  path.push(hover)
  return { nextPath: path, changed: true, lint: 'extend' }
}
