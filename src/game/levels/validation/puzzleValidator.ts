import { GRID_SIZE } from '@/types/grid'
import type { CcColorKey } from '@/lib/palette'
import type {
  PuzzleDifficulty,
  PuzzlePairDef,
  PuzzleRecordV1,
} from '@/game/levels/schemas/puzzleRecord'
import { PUZZLE_FORMAT_VERSION } from '@/game/levels/schemas/puzzleRecord'

const PAIR_COLORS = new Set<CcColorKey>(['moss', 'rose', 'beige', 'midnight'])

const DIFFICULTIES = new Set<PuzzleDifficulty>(['beginner', 'intermediate', 'advanced', 'expert'])

export type PuzzleValidationIssue = {
  path: string
  message: string
}

export type PuzzleValidationResult =
  | { ok: true; value: PuzzleRecordV1 }
  | { ok: false; issues: PuzzleValidationIssue[] }

function issue(path: string, message: string): PuzzleValidationIssue {
  return { path, message }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function validatePuzzleRecord(raw: unknown): PuzzleValidationResult {
  const issues: PuzzleValidationIssue[] = []

  if (!isRecord(raw)) {
    return { ok: false, issues: [issue('$', 'Puzzle root must be an object')] }
  }

  if (raw.version !== PUZZLE_FORMAT_VERSION) {
    issues.push(issue('version', `Expected version ${PUZZLE_FORMAT_VERSION}`))
  }

  if (typeof raw.id !== 'string' || !raw.id.trim()) {
    issues.push(issue('id', 'Missing non-empty string id'))
  }

  if (typeof raw.title !== 'string' || !raw.title.trim()) {
    issues.push(issue('title', 'Missing non-empty title'))
  }

  if (typeof raw.size !== 'number' || !Number.isInteger(raw.size)) {
    issues.push(issue('size', 'size must be an integer'))
  } else if (raw.size !== GRID_SIZE) {
    issues.push(issue('size', `Only grid size ${GRID_SIZE} is supported in this build`))
  }

  if (typeof raw.difficulty !== 'string' || !DIFFICULTIES.has(raw.difficulty as PuzzleDifficulty)) {
    issues.push(issue('difficulty', 'Invalid difficulty'))
  }

  if (typeof raw.palette !== 'string' || !raw.palette.trim()) {
    issues.push(issue('palette', 'palette must be a non-empty string'))
  }

  if (!Array.isArray(raw.pairs)) {
    issues.push(issue('pairs', 'pairs must be an array'))
  }

  if (issues.length) return { ok: false, issues }

  const pairs = raw.pairs as unknown[]
  if (pairs.length === 0) {
    issues.push(issue('pairs', 'At least one pair is required'))
  }

  const seenCells = new Set<string>()

  for (let i = 0; i < pairs.length; i += 1) {
    const p = pairs[i]
    const prefix = `pairs[${i}]`
    if (!isRecord(p)) {
      issues.push(issue(prefix, 'Pair must be an object'))
      continue
    }

    const color = p.color
    if (typeof color !== 'string' || !PAIR_COLORS.has(color as CcColorKey)) {
      issues.push(issue(`${prefix}.color`, 'Unsupported or invalid pair color'))
    }

    const a = p.a
    const b = p.b
    if (!isRecord(a) || !isRecord(b)) {
      issues.push(issue(prefix, 'Endpoints a and b must be objects'))
      continue
    }

    for (const [label, pt] of [
      ['a', a],
      ['b', b],
    ] as const) {
      const col = pt.col
      const row = pt.row
      if (
        typeof col !== 'number' ||
        typeof row !== 'number' ||
        !Number.isInteger(col) ||
        !Number.isInteger(row)
      ) {
        issues.push(issue(`${prefix}.${label}`, 'col and row must be integers'))
        continue
      }
      if (col < 0 || row < 0 || col >= GRID_SIZE || row >= GRID_SIZE) {
        issues.push(issue(`${prefix}.${label}`, 'Endpoint out of bounds'))
      }
      const key = `${col},${row}`
      if (seenCells.has(key)) {
        issues.push(issue(`${prefix}.${label}`, `Duplicate endpoint cell ${key}`))
      }
      seenCells.add(key)
    }

    if (
      isRecord(a) &&
      isRecord(b) &&
      typeof a.col === 'number' &&
      typeof a.row === 'number' &&
      typeof b.col === 'number' &&
      typeof b.row === 'number' &&
      a.col === b.col &&
      a.row === b.row
    ) {
      issues.push(issue(prefix, 'Endpoints a and b must differ'))
    }
  }

  if (issues.length) return { ok: false, issues }

  const value: PuzzleRecordV1 = {
    version: PUZZLE_FORMAT_VERSION,
    id: String(raw.id).trim(),
    title: String(raw.title).trim(),
    size: raw.size as number,
    difficulty: raw.difficulty as PuzzleDifficulty,
    palette: String(raw.palette).trim(),
    pairs: pairs as PuzzlePairDef[],
    metadata: isRecord(raw.metadata) ? raw.metadata : undefined,
  }

  return { ok: true, value }
}
