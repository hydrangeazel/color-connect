import { validatePuzzleRecord } from '@/game/levels/validation/puzzleValidator'
import type { PuzzleRecordV1 } from '@/game/levels/schemas/puzzleRecord'
import { validateDisjointPaths } from '@/game/solver/disjointPaths'
import type { CcColorKey } from '@/lib/palette'
import type { GridCell } from '@/types/grid'

const SERIAL_ORDER: CcColorKey[] = ['moss', 'rose', 'beige', 'midnight']

export type GeneratedValidation = {
  ok: boolean
  issues: string[]
}

/**
 * Validates a generator-produced solution + exported record.
 */
export function validateGeneratedBundle(
  paths: ReadonlyMap<CcColorKey, readonly GridCell[]>,
  record: PuzzleRecordV1,
): GeneratedValidation {
  const issues: string[] = []

  const geom = validateDisjointPaths(paths)
  if (!geom.ok) issues.push(...geom.issues)

  const schema = validatePuzzleRecord(record)
  if (!schema.ok) {
    for (const i of schema.issues) {
      issues.push(`${i.path}: ${i.message}`)
    }
  }

  return { ok: issues.length === 0, issues }
}

export function stableColorOrder(): readonly CcColorKey[] {
  return SERIAL_ORDER
}
