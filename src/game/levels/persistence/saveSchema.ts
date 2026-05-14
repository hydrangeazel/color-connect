export const SAVE_STORAGE_KEY = 'color-connect.save.v1' as const

export const SAVE_SCHEMA_VERSION = 1 as const

export type SaveFileV1 = {
  v: typeof SAVE_SCHEMA_VERSION
  unlockedLevelIds: string[]
  solvedLevelIds: string[]
  currentLevelId: string | null
  settings?: {
    prefersReducedMotion?: boolean
  }
}

export function createEmptySave(firstLevelId: string): SaveFileV1 {
  return {
    v: SAVE_SCHEMA_VERSION,
    unlockedLevelIds: [firstLevelId],
    solvedLevelIds: [],
    currentLevelId: firstLevelId,
    settings: {},
  }
}
