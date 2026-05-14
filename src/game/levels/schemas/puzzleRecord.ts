import type { CcColorKey } from '@/lib/palette'

/** Serialized puzzle format version — bump when breaking schema changes occur. */
export const PUZZLE_FORMAT_VERSION = 1 as const

export type PuzzleDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export type PuzzlePaletteId = 'cozy-default' | string

export type PuzzlePairDef = {
  color: CcColorKey
  a: { col: number; row: number }
  b: { col: number; row: number }
}

/**
 * Serialization-first puzzle record. Designed for catalog files, remote CDN payloads,
 * and future procedural generators that emit the same shape.
 */
export type PuzzleRecordV1 = {
  version: typeof PUZZLE_FORMAT_VERSION
  id: string
  title: string
  size: number
  difficulty: PuzzleDifficulty
  palette: PuzzlePaletteId
  pairs: readonly PuzzlePairDef[]
  metadata?: Record<string, unknown>
}

export type CatalogEntry = {
  id: string
  record: PuzzleRecordV1
}
