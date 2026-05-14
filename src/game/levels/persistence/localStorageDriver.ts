import { SAVE_STORAGE_KEY, type SaveFileV1 } from '@/game/levels/persistence/saveSchema'

function safeParse(json: string): unknown {
  try {
    return JSON.parse(json) as unknown
  } catch {
    return null
  }
}

export function readSaveFromLocalStorage(): SaveFileV1 | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(SAVE_STORAGE_KEY)
  if (!raw) return null
  const parsed = safeParse(raw)
  if (!parsed || typeof parsed !== 'object') return null
  const obj = parsed as Record<string, unknown>
  if (obj.v !== 1) return null
  if (!Array.isArray(obj.unlockedLevelIds) || !Array.isArray(obj.solvedLevelIds)) return null
  return parsed as SaveFileV1
}

export function writeSaveToLocalStorage(save: SaveFileV1): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(save))
}

export function clearSaveFromLocalStorage(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(SAVE_STORAGE_KEY)
}
