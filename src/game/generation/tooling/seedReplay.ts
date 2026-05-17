import type { PuzzleDifficulty } from '@/game/levels/schemas/puzzleRecord'

/** Serializable handle for daily puzzles, share links, or editor replay. */
export type SeedReplayEnvelopeV1 = {
  v: 1
  seed: string
  target: PuzzleDifficulty
  generator: 'partition-bfs-v1'
}

export function createSeedReplayEnvelope(
  seed: string,
  target: PuzzleDifficulty,
): SeedReplayEnvelopeV1 {
  return { v: 1, seed, target, generator: 'partition-bfs-v1' }
}

export function serializeSeedReplay(envelope: SeedReplayEnvelopeV1): string {
  return JSON.stringify(envelope)
}
