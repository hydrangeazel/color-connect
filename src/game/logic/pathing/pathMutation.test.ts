import { describe, expect, it } from 'vitest'

import { cellsEqual } from '@/game/logic/pathing/cellMath'
import { applyHoverPathStep, type PairEndpointsByColor } from '@/game/logic/pathing/pathMutation'
import type { PathsState } from '@/game/logic/pathing/occupation'

import type { GridCell } from '@/types/grid'

const scratch = new Uint8Array(64)

const noPairs: PairEndpointsByColor = {}

function pathOf(...cells: GridCell[]): GridCell[] {
  return cells
}

describe('applyHoverPathStep', () => {
  it('extends along an empty neighbor', () => {
    const paths: PathsState = {
      moss: pathOf({ col: 1, row: 1 }, { col: 2, row: 1 }),
    }
    const r = applyHoverPathStep(paths, 'moss', { col: 3, row: 1 }, null, scratch, noPairs)
    expect(r.changed).toBe(true)
    expect(r.lint).toBe('extend')
    expect(r.nextPath).toEqual(pathOf({ col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 }))
  })

  it('backtracks to previous cell', () => {
    const paths: PathsState = {
      moss: pathOf({ col: 1, row: 1 }, { col: 2, row: 1 }),
    }
    const r = applyHoverPathStep(paths, 'moss', { col: 1, row: 1 }, { col: 2, row: 1 }, scratch, noPairs)
    expect(r.changed).toBe(true)
    expect(r.lint).toBe('backstep')
    expect(r.nextPath).toEqual(pathOf({ col: 1, row: 1 }))
  })

  it('truncates when re-entering an earlier cell', () => {
    const paths: PathsState = {
      moss: pathOf({ col: 1, row: 1 }, { col: 2, row: 1 }, { col: 2, row: 2 }),
    }
    const r = applyHoverPathStep(paths, 'moss', { col: 1, row: 1 }, { col: 2, row: 2 }, scratch, noPairs)
    expect(r.changed).toBe(true)
    expect(r.lint).toBe('truncate')
    expect(r.nextPath).toEqual(pathOf({ col: 1, row: 1 }))
  })

  it('severs the other color path then extends when entering their pipe', () => {
    const paths: PathsState = {
      moss: pathOf({ col: 1, row: 1 }),
      rose: pathOf({ col: 2, row: 1 }),
    }
    const r = applyHoverPathStep(paths, 'moss', { col: 2, row: 1 }, null, scratch, noPairs)
    expect(r.changed).toBe(true)
    expect(r.lint).toBe('sever_extend')
    expect(r.nextPath).toEqual(pathOf({ col: 1, row: 1 }, { col: 2, row: 1 }))
    expect(r.coercedTruncations).toEqual({ rose: [] })
  })

  it('cuts the other path from the collision cell onward (multi-cell)', () => {
    const paths: PathsState = {
      moss: pathOf({ col: 1, row: 1 }, { col: 1, row: 2 }),
      rose: pathOf({ col: 2, row: 1 }, { col: 2, row: 2 }, { col: 2, row: 3 }),
    }
    const r = applyHoverPathStep(paths, 'moss', { col: 2, row: 2 }, null, scratch, noPairs)
    expect(r.changed).toBe(true)
    expect(r.lint).toBe('sever_extend')
    expect(r.nextPath).toEqual(pathOf({ col: 1, row: 1 }, { col: 1, row: 2 }, { col: 2, row: 2 }))
    expect(r.coercedTruncations?.rose).toEqual(pathOf({ col: 2, row: 1 }))
  })

  it('blocks stepping onto another color endpoint when that path is still empty', () => {
    const paths: PathsState = {
      moss: pathOf({ col: 1, row: 1 }, { col: 2, row: 1 }),
    }
    const pairByColor: PairEndpointsByColor = {
      rose: { a: { col: 3, row: 1 }, b: { col: 0, row: 7 } },
    }
    const r = applyHoverPathStep(paths, 'moss', { col: 3, row: 1 }, null, scratch, pairByColor)
    expect(r.changed).toBe(false)
    expect(r.lint).toBe('blocked')
    expect(r.nextPath).toEqual(paths.moss)
  })

  it('still allows orthogonal extend onto own other endpoint', () => {
    const paths: PathsState = {
      moss: pathOf({ col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 }),
    }
    const pairByColor: PairEndpointsByColor = {
      moss: { a: { col: 1, row: 1 }, b: { col: 4, row: 1 } },
    }
    const r = applyHoverPathStep(paths, 'moss', { col: 4, row: 1 }, null, scratch, pairByColor)
    expect(r.changed).toBe(true)
    expect(r.lint).toBe('extend')
  })

  it('blocks extending past the partner once the pair is fully connected', () => {
    const paths: PathsState = {
      moss: pathOf({ col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 }),
    }
    const pairByColor: PairEndpointsByColor = {
      moss: { a: { col: 1, row: 1 }, b: { col: 3, row: 1 } },
    }
    const r = applyHoverPathStep(paths, 'moss', { col: 4, row: 1 }, null, scratch, pairByColor)
    expect(r.changed).toBe(false)
    expect(r.lint).toBe('blocked')
    expect(r.nextPath).toEqual(paths.moss)
  })

  it('still allows backstep from a completed path', () => {
    const paths: PathsState = {
      moss: pathOf({ col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 }),
    }
    const pairByColor: PairEndpointsByColor = {
      moss: { a: { col: 1, row: 1 }, b: { col: 3, row: 1 } },
    }
    const r = applyHoverPathStep(paths, 'moss', { col: 2, row: 1 }, { col: 3, row: 1 }, scratch, pairByColor)
    expect(r.changed).toBe(true)
    expect(r.lint).toBe('backstep')
    expect(r.nextPath).toEqual(pathOf({ col: 1, row: 1 }, { col: 2, row: 1 }))
  })

  it('dedupes identical hover via lastApplied', () => {
    const paths: PathsState = { moss: pathOf({ col: 0, row: 0 }) }
    const hover = { col: 1, row: 0 }
    const first = applyHoverPathStep(paths, 'moss', hover, null, scratch, noPairs)
    expect(first.changed).toBe(true)
    const second = applyHoverPathStep({ moss: first.nextPath }, 'moss', hover, hover, scratch, noPairs)
    expect(second.changed).toBe(false)
    expect(cellsEqual(second.nextPath[1], hover)).toBe(true)
  })
})
