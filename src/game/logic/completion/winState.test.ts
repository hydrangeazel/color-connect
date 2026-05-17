import { describe, expect, it } from 'vitest'

import { computePuzzleSolved, isGridFullyCovered } from '@/game/logic/completion/winState'
import { CELL_COUNT } from '@/game/logic/pathing/cellMath'
import type { PathsState } from '@/game/logic/pathing/occupation'
import type { ColorPair } from '@/types/puzzle'
import type { GridCell } from '@/types/grid'
import { GRID_SIZE } from '@/types/grid'

function serpentineTour(): GridCell[] {
  const cells: GridCell[] = []
  for (let row = 0; row < GRID_SIZE; row += 1) {
    if (row % 2 === 0) {
      for (let col = 0; col < GRID_SIZE; col += 1) cells.push({ col, row })
    } else {
      for (let col = GRID_SIZE - 1; col >= 0; col -= 1) cells.push({ col, row })
    }
  }
  return cells
}

describe('isGridFullyCovered', () => {
  it('is false when paths cover only part of the board', () => {
    const paths: PathsState = {
      moss: [
        { col: 0, row: 0 },
        { col: 1, row: 0 },
      ],
    }
    expect(isGridFullyCovered(paths)).toBe(false)
  })

  it('is true when the union of all paths covers every cell', () => {
    const tour = serpentineTour()
    expect(tour.length).toBe(CELL_COUNT)
    const paths: PathsState = { moss: tour }
    expect(isGridFullyCovered(paths)).toBe(true)
  })
})

describe('computePuzzleSolved', () => {
  it('requires a full grid, not only completed endpoint pairs', () => {
    const pairs: ColorPair[] = [
      { color: 'moss', a: { col: 0, row: 0 }, b: { col: 1, row: 0 } },
    ]
    const paths: PathsState = {
      moss: [
        { col: 0, row: 0 },
        { col: 1, row: 0 },
      ],
    }
    expect(computePuzzleSolved(pairs, paths)).toBe(false)
  })

  it('is true when every pair is complete and every cell is used', () => {
    const tour = serpentineTour()
    const pairs: ColorPair[] = [
      { color: 'moss', a: tour[0], b: tour[tour.length - 1] },
    ]
    const paths: PathsState = { moss: tour }
    expect(computePuzzleSolved(pairs, paths)).toBe(true)
  })
})
