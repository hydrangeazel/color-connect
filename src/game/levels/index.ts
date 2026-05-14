export { PUZZLE_FORMAT_VERSION, type PuzzleRecordV1 } from '@/game/levels/schemas/puzzleRecord'
export {
  validatePuzzleRecord,
  type PuzzleValidationResult,
} from '@/game/levels/validation/puzzleValidator'
export {
  assertValidPuzzlePayload,
  boardNodesFromPuzzle,
  clonePuzzleRecord,
  loadCatalogEntry,
  parseUnknownPuzzlePayload,
  type LoadedPuzzle,
} from '@/game/levels/loaders/puzzleLoader'
export { BUILTIN_PUZZLES } from '@/game/levels/registry/builtinCatalog'
export { hydrateProgress, type HydrateResult } from '@/game/levels/persistence/hydrateProgress'
export {
  SAVE_STORAGE_KEY,
  SAVE_SCHEMA_VERSION,
  createEmptySave,
  type SaveFileV1,
} from '@/game/levels/persistence/saveSchema'
export {
  readSaveFromLocalStorage,
  writeSaveToLocalStorage,
  clearSaveFromLocalStorage,
} from '@/game/levels/persistence/localStorageDriver'
export {
  useLevelFlowStore,
  type LevelTransition,
  type LevelFlowSnapshot,
} from '@/game/levels/progression/levelFlowStore'
