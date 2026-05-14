import { describe, expect, it } from 'vitest'

import { cellsEqual } from '@/game/logic/pathing/cellMath'
import { applyHoverPathStep } from '@/game/logic/pathing/pathMutation'
import type { PathsState } from '@/game/logic/pathing/occupation'

import type { GridCell } from '@/types/grid'

const scratch = new Uint8Array(64)

function pathOf(...cells: GridCell[]): GridCell[] {
  return cells
}

describe('applyHoverPathStep', () => {
  it('extends along an empty neighbor', () => {
    const paths: PathsState = {
      moss: pathOf({ col: 1, row: 1 }, { col: 2, row: 1 }),
    }
    const r = applyHoverPathStep(paths, 'moss', { col: 3, row: 1 }, null, scratch)
    expect(r.changed).toBe(true)
    expect(r.lint).toBe('extend')
    expect(r.nextPath).toEqual(pathOf({ col: 1, row: 1 }, { col: 2, row: 1 }, { col: 3, row: 1 }))
  })

  it('backtracks to previous cell', () => {
    const paths: PathsState = {
      moss: pathOf({ col: 1, row: 1 }, { col: 2, row: 1 }),
    }
    const r = applyHoverPathStep(paths, 'moss', { col: 1, row: 1 }, { col: 2, row: 1 }, scratch)
    expect(r.changed).toBe(true)
    expect(r.lint).toBe('backstep')
    expect(r.nextPath).toEqual(pathOf({ col: 1, row: 1 }))
  })

  it('truncates when re-entering an earlier cell', () => {
    const paths: PathsState = {
      moss: pathOf({ col: 1, row: 1 }, { col: 2, row: 1 }, { col: 2, row: 2 }),
    }
    const r = applyHoverPathStep(paths, 'moss', { col: 1, row: 1 }, { col: 2, row: 2 }, scratch)
    expect(r.changed).toBe(true)
    expect(r.lint).toBe('truncate')
    expect(r.nextPath).toEqual(pathOf({ col: 1, row: 1 }))
  })

  it('blocks orthogonal step onto another color', () => {
    const paths: PathsState = {
      moss: pathOf({ col: 1, row: 1 }),
      rose: pathOf({ col: 2, row: 1 }),
    }
    const r = applyHoverPathStep(paths, 'moss', { col: 2, row: 1 }, null, scratch)
    expect(r.changed).toBe(false)
    expect(r.lint).toBe('blocked')
    expect(r.nextPath).toEqual(paths.moss)
  })

  it('dedupes identical hover via lastApplied', () => {
    const paths: PathsState = { moss: pathOf({ col: 0, row: 0 }) }
    const hover = { col: 1, row: 0 }
    const first = applyHoverPathStep(paths, 'moss', hover, null, scratch)
    expect(first.changed).toBe(true)
    const second = applyHoverPathStep({ moss: first.nextPath }, 'moss', hover, hover, scratch)
    expect(second.changed).toBe(false)
    expect(cellsEqual(second.nextPath[1], hover)).toBe(true)
  })
})
