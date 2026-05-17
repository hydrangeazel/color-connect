import type { SolutionBoardAnalysis } from '@/game/generation/heuristics/boardMetrics'
import type { PuzzleDifficulty } from '@/game/levels/schemas/puzzleRecord'

export type QualityResult = {
  accepted: boolean
  /** Higher is better within the same generator version. */
  score: number
  reasons: string[]
}

/**
 * Maps analysis metrics to a difficulty label using thresholds (not random).
 */
export function classifyDifficulty(analysis: SolutionBoardAnalysis): PuzzleDifficulty {
  const { occupancy, meanTurns, junctionPressure, minPathLength } = analysis

  if (minPathLength < 3) return 'beginner'

  if (occupancy < 0.38 && meanTurns < 3.2 && junctionPressure < 10) return 'beginner'
  if (occupancy < 0.48 && meanTurns < 4.2 && junctionPressure < 18) return 'intermediate'
  if (occupancy < 0.58 || meanTurns < 5.5) return 'advanced'
  return 'expert'
}

const TIER_FLOORS: Record<PuzzleDifficulty, { minCells: number; minMeanTurns: number }> = {
  beginner: { minCells: 26, minMeanTurns: 1.2 },
  intermediate: { minCells: 30, minMeanTurns: 1.8 },
  advanced: { minCells: 34, minMeanTurns: 2.2 },
  expert: { minCells: 36, minMeanTurns: 2.6 },
}

/**
 * Filters trivial / degenerate layouts and scores remaining candidates.
 */
export function scoreGenerationCandidate(
  analysis: SolutionBoardAnalysis,
  target: PuzzleDifficulty,
): QualityResult {
  const reasons: string[] = []
  const cells = Math.round(analysis.occupancy * analysis.gridSize * analysis.gridSize)

  if (analysis.minPathLength < 3) {
    reasons.push('path too short')
  }
  if (analysis.occupancy < 0.28) {
    reasons.push('board too open')
  }
  if (analysis.occupancy > 0.92) {
    reasons.push('overcrowded')
  }

  const floor = TIER_FLOORS[target]
  if (cells < floor.minCells) {
    reasons.push('insufficient fill for tier')
  }
  if (analysis.meanTurns < floor.minMeanTurns) {
    reasons.push('low interaction complexity')
  }

  const accepted = reasons.length === 0

  const score =
    analysis.occupancy * 42 +
    analysis.meanTurns * 11 +
    analysis.junctionPressure * 0.35 +
    analysis.deadEndVacancy * 0.12

  return { accepted, score, reasons }
}
