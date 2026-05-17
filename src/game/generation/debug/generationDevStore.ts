import { create } from 'zustand'

import { formatGenerationDiagnostics } from '@/game/generation/debug/generationDiagnostics'
import { generatePuzzle } from '@/game/generation/pipeline/generatePuzzle'
import type { PuzzleDifficulty } from '@/game/levels/schemas/puzzleRecord'
import { loadCatalogEntry } from '@/game/levels/loaders/puzzleLoader'
import { useLevelFlowStore } from '@/game/levels/progression/levelFlowStore'

export type GenerationDevSnapshot = {
  lastSeed: string | null
  lastTarget: PuzzleDifficulty | null
  lastAttempt: number | null
  lastGenMs: number | null
  lastScore: number | null
  lastClassified: PuzzleDifficulty | null
  lastOccupancy: number | null
  lastMeanTurns: number | null
  lastJunctionPressure: number | null
  lastDiagnostics: readonly string[] | null
  lastError: string | null
  isGenerating: boolean
}

type GenerationDevStore = GenerationDevSnapshot & {
  /** Runs generator off the React commit phase; dev / tooling entry point. */
  generateAndPlay: (seed: string, target?: PuzzleDifficulty) => Promise<void>
  clearLast: () => void
}

const initial: GenerationDevSnapshot = {
  lastSeed: null,
  lastTarget: null,
  lastAttempt: null,
  lastGenMs: null,
  lastScore: null,
  lastClassified: null,
  lastOccupancy: null,
  lastMeanTurns: null,
  lastJunctionPressure: null,
  lastDiagnostics: null,
  lastError: null,
  isGenerating: false,
}

export const useGenerationDevStore = create<GenerationDevStore>((set) => ({
  ...initial,

  clearLast: () => set({ ...initial, isGenerating: false }),

  generateAndPlay: async (seed, target = 'intermediate') => {
    set({ isGenerating: true, lastError: null, lastSeed: seed, lastTarget: target })
    await Promise.resolve()
    const result = generatePuzzle({ seed, target })
    if (!result.ok) {
      set({
        isGenerating: false,
        lastError: result.reason,
        lastGenMs: result.genMs,
        lastDiagnostics: null,
      })
      return
    }

    const loaded = loadCatalogEntry(result.record)
    useLevelFlowStore.getState().playGeneratedPuzzle(loaded)

    const diag = formatGenerationDiagnostics(result)
    set({
      isGenerating: false,
      lastAttempt: result.attemptUsed,
      lastGenMs: result.genMs,
      lastScore: result.quality.score,
      lastClassified: result.classifiedDifficulty,
      lastOccupancy: result.analysis.occupancy,
      lastMeanTurns: result.analysis.meanTurns,
      lastJunctionPressure: result.analysis.junctionPressure,
      lastDiagnostics: diag,
      lastError: null,
    })
  },
}))
