import { PUZZLE_FORMAT_VERSION } from '@/game/levels/schemas/puzzleRecord'
import type { PuzzleRecordV1, PuzzlePairDef } from '@/game/levels/schemas/puzzleRecord'
import { stableColorOrder } from '@/game/generation/validation/generatedPuzzleValidation'
import type { CcColorKey } from '@/lib/palette'
import { GRID_SIZE, type GridCell } from '@/types/grid'

function slugFromSeed(seed: string, attempt: number): string {
  let h = 0
  const s = `${seed}#${attempt}`
  for (let i = 0; i < s.length; i += 1) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

export function pathsToPuzzleRecord(options: {
  seed: string
  attempt: number
  paths: ReadonlyMap<CcColorKey, readonly GridCell[]>
  titleSuffix?: string
  difficulty: PuzzleRecordV1['difficulty']
  extraMetadata?: Record<string, unknown>
}): PuzzleRecordV1 {
  const slug = slugFromSeed(options.seed, options.attempt)
  const pairs: PuzzlePairDef[] = []
  for (const color of stableColorOrder()) {
    const path = options.paths.get(color)
    if (!path?.length) continue
    const a = path[0]!
    const b = path[path.length - 1]!
    pairs.push({
      color,
      a: { col: a.col, row: a.row },
      b: { col: b.col, row: b.row },
    })
  }

  const meta: Record<string, unknown> = {
    generator: 'partition-bfs-v1',
    seed: options.seed,
    attempt: options.attempt,
    ...options.extraMetadata,
  }

  return {
    version: PUZZLE_FORMAT_VERSION,
    id: `generated:${slug}`,
    title: options.titleSuffix ? `Generated · ${options.titleSuffix}` : `Generated · ${slug}`,
    size: GRID_SIZE,
    difficulty: options.difficulty,
    palette: 'cozy-default',
    pairs,
    metadata: meta,
  }
}

export function serializePuzzleRecord(record: PuzzleRecordV1): string {
  return `${JSON.stringify(record, null, 2)}\n`
}
