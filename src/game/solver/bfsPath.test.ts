import { describe, expect, it } from 'vitest'

import { CELL_COUNT, cellToIndex } from '@/game/logic/pathing/cellMath'
import { bfsShortestPath, hasOrthogonalPath } from '@/game/solver/bfsPath'

describe('bfsShortestPath', () => {
  it('finds a corridor path', () => {
    const occ = new Uint8Array(CELL_COUNT)
    occ.fill(1)
    for (let col = 0; col < 8; col += 1) {
      occ[cellToIndex({ col, row: 3 })] = 0
    }
    const p = bfsShortestPath(occ, { col: 0, row: 3 }, { col: 7, row: 3 })
    expect(p).not.toBeNull()
    expect(p!.length).toBe(8)
  })

  it('returns null when fully walled off', () => {
    const occ = new Uint8Array(CELL_COUNT)
    occ.fill(1)
    occ[cellToIndex({ col: 0, row: 0 })] = 0
    occ[cellToIndex({ col: 7, row: 7 })] = 0
    expect(bfsShortestPath(occ, { col: 0, row: 0 }, { col: 7, row: 7 })).toBeNull()
    expect(hasOrthogonalPath(occ, { col: 0, row: 0 }, { col: 7, row: 7 })).toBe(false)
  })
})
