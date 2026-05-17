import {
  tryBuildPartitionedPaths,
  createPartitionRng,
} from '@/game/generation/algorithms/partitionedPaths'
import { analyzeSolutionLayout } from '@/game/generation/heuristics/boardMetrics'
import { partitionParamsForTier } from '@/game/generation/heuristics/tierParams'
import { pathsToPuzzleRecord } from '@/game/generation/export/toPuzzleRecord'
import {
  classifyDifficulty,
  scoreGenerationCandidate,
} from '@/game/generation/scoring/qualityScore'
import { validateGeneratedBundle } from '@/game/generation/validation/generatedPuzzleValidation'
import type { PuzzleRecordV1, PuzzleDifficulty } from '@/game/levels/schemas/puzzleRecord'
import type { CcColorKey } from '@/lib/palette'
import { GRID_SIZE, type GridCell } from '@/types/grid'

export type GeneratePuzzleInput = {
  seed: string
  /** Used for partition search pressure + quality floors. */
  target?: PuzzleDifficulty
  maxAttempts?: number
}

export type GeneratePuzzleOk = {
  ok: true
  record: PuzzleRecordV1
  paths: Map<CcColorKey, GridCell[]>
  attemptUsed: number
  genMs: number
  analysis: ReturnType<typeof analyzeSolutionLayout>
  classifiedDifficulty: PuzzleDifficulty
  quality: ReturnType<typeof scoreGenerationCandidate>
}

export type GeneratePuzzleFail = {
  ok: false
  reason: string
  attempts: number
  genMs: number
}

export type GeneratePuzzleResult = GeneratePuzzleOk | GeneratePuzzleFail

const DEFAULT_ATTEMPTS = 48

/**
 * Deterministic procedural pipeline: same `seed` + same `target` ⇒ same puzzle
 * (first accepted attempt index is stable for a fixed generator version).
 */
export function generatePuzzle(input: GeneratePuzzleInput): GeneratePuzzleResult {
  const t0 = performance.now()
  const target = input.target ?? 'intermediate'
  const max = input.maxAttempts ?? DEFAULT_ATTEMPTS
  const params = partitionParamsForTier(target)

  for (let attempt = 0; attempt < max; attempt += 1) {
    const rng = createPartitionRng(input.seed, attempt)
    const paths = tryBuildPartitionedPaths(rng, params)
    if (!paths) continue

    const analysis = analyzeSolutionLayout(paths, GRID_SIZE)
    const classified = classifyDifficulty(analysis)
    const quality = scoreGenerationCandidate(analysis, target)
    if (!quality.accepted) continue

    const record = pathsToPuzzleRecord({
      seed: input.seed,
      attempt,
      paths,
      difficulty: classified,
      titleSuffix: input.seed.slice(0, 18),
      extraMetadata: {
        target,
        qualityScore: quality.score,
        occupancy: analysis.occupancy,
        meanTurns: analysis.meanTurns,
        junctionPressure: analysis.junctionPressure,
        classified,
      },
    })

    const bundle = validateGeneratedBundle(paths, record)
    if (!bundle.ok) continue

    const genMs = performance.now() - t0
    return {
      ok: true,
      record,
      paths,
      attemptUsed: attempt,
      genMs,
      analysis,
      classifiedDifficulty: classified,
      quality,
    }
  }

  return {
    ok: false,
    reason: 'No layout satisfied validation and quality filters',
    attempts: max,
    genMs: performance.now() - t0,
  }
}

/**
 * Future: post to a Web Worker — keep message shapes JSON-serializable.
 * @example { type: 'GENERATE', seed: 'daily-2026-05-14', target: 'advanced' }
 */
export type GenerationWorkerRequest = {
  type: 'GENERATE'
  seed: string
  target?: PuzzleDifficulty
  maxAttempts?: number
}

export type GenerationWorkerResponse =
  | { type: 'OK'; payload: GeneratePuzzleOk }
  | { type: 'FAIL'; payload: GeneratePuzzleFail }
