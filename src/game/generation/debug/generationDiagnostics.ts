import type { GeneratePuzzleOk } from '@/game/generation/pipeline/generatePuzzle'

export function formatGenerationDiagnostics(result: GeneratePuzzleOk): string[] {
  const a = result.analysis
  return [
    `seed ${String(result.record.metadata?.seed ?? '—')}`,
    `attempt ${result.attemptUsed}`,
    `gen ${result.genMs.toFixed(1)}ms`,
    `score ${result.quality.score.toFixed(1)}`,
    `classify ${result.classifiedDifficulty}`,
    `occ ${(a.occupancy * 100).toFixed(0)}%`,
    `turns μ ${a.meanTurns.toFixed(2)}`,
    `junctions ${a.junctionPressure}`,
    `deadVac ${a.deadEndVacancy}`,
  ]
}
