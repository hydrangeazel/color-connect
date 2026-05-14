import { describe, expect, it } from 'vitest'

import { PUZZLE_FORMAT_VERSION } from '@/game/levels/schemas/puzzleRecord'
import { validatePuzzleRecord } from '@/game/levels/validation/puzzleValidator'

const validMinimal = {
  version: PUZZLE_FORMAT_VERSION,
  id: 'test-puzzle',
  title: 'Test',
  size: 8,
  difficulty: 'beginner' as const,
  palette: 'cozy-default',
  pairs: [
    { color: 'moss' as const, a: { col: 0, row: 0 }, b: { col: 1, row: 0 } },
    { color: 'rose' as const, a: { col: 0, row: 1 }, b: { col: 1, row: 1 } },
  ],
}

describe('validatePuzzleRecord', () => {
  it('accepts a well-formed record', () => {
    const res = validatePuzzleRecord(validMinimal)
    expect(res.ok).toBe(true)
    if (!res.ok) return
    expect(res.value.id).toBe('test-puzzle')
    expect(res.value.pairs).toHaveLength(2)
  })

  it('rejects non-object root', () => {
    const res = validatePuzzleRecord(null)
    expect(res.ok).toBe(false)
    if (res.ok) return
    expect(res.issues[0]?.path).toBe('$')
  })

  it('rejects wrong version', () => {
    const res = validatePuzzleRecord({ ...validMinimal, version: 99 })
    expect(res.ok).toBe(false)
    if (res.ok) return
    expect(res.issues.some((i) => i.path === 'version')).toBe(true)
  })

  it('rejects duplicate endpoint cells', () => {
    const res = validatePuzzleRecord({
      ...validMinimal,
      pairs: [
        { color: 'moss', a: { col: 0, row: 0 }, b: { col: 1, row: 0 } },
        { color: 'rose', a: { col: 0, row: 0 }, b: { col: 2, row: 0 } },
      ],
    })
    expect(res.ok).toBe(false)
    if (res.ok) return
    expect(res.issues.some((i) => i.message.includes('Duplicate'))).toBe(true)
  })

  it('rejects identical endpoints on a pair', () => {
    const res = validatePuzzleRecord({
      ...validMinimal,
      pairs: [{ color: 'moss', a: { col: 2, row: 2 }, b: { col: 2, row: 2 } }],
    })
    expect(res.ok).toBe(false)
    if (res.ok) return
    expect(res.issues.some((i) => i.message.includes('differ'))).toBe(true)
  })

  it('rejects out-of-bounds coordinates', () => {
    const res = validatePuzzleRecord({
      ...validMinimal,
      pairs: [{ color: 'moss', a: { col: 8, row: 0 }, b: { col: 1, row: 0 } }],
    })
    expect(res.ok).toBe(false)
    if (res.ok) return
    expect(res.issues.some((i) => i.message.includes('bounds'))).toBe(true)
  })
})
