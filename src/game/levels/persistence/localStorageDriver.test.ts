import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  clearSaveFromLocalStorage,
  readSaveFromLocalStorage,
  writeSaveToLocalStorage,
} from '@/game/levels/persistence/localStorageDriver'
import { SAVE_STORAGE_KEY, type SaveFileV1 } from '@/game/levels/persistence/saveSchema'

function createMemoryStorage() {
  const map = new Map<string, string>()
  return {
    getItem: vi.fn((k: string) => map.get(k) ?? null),
    setItem: vi.fn((k: string, v: string) => {
      map.set(k, v)
    }),
    removeItem: vi.fn((k: string) => {
      map.delete(k)
    }),
    _map: map,
  }
}

describe('localStorageDriver', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('roundtrips a versioned save payload', () => {
    const mem = createMemoryStorage()
    vi.stubGlobal('localStorage', mem)

    const payload: SaveFileV1 = {
      v: 1,
      unlockedLevelIds: ['a', 'b'],
      solvedLevelIds: ['a'],
      currentLevelId: 'b',
      settings: { prefersReducedMotion: true },
    }
    writeSaveToLocalStorage(payload)
    expect(mem.setItem).toHaveBeenCalled()
    const raw = mem._map.get(SAVE_STORAGE_KEY)
    expect(raw).toBeTruthy()

    const read = readSaveFromLocalStorage()
    expect(read).toEqual(payload)
  })

  it('returns null for corrupt json', () => {
    const mem = createMemoryStorage()
    mem._map.set(SAVE_STORAGE_KEY, '{')
    vi.stubGlobal('localStorage', mem)
    expect(readSaveFromLocalStorage()).toBeNull()
  })

  it('clearSaveFromLocalStorage removes the key', () => {
    const mem = createMemoryStorage()
    mem._map.set(SAVE_STORAGE_KEY, '{}')
    vi.stubGlobal('localStorage', mem)
    clearSaveFromLocalStorage()
    expect(mem.removeItem).toHaveBeenCalledWith(SAVE_STORAGE_KEY)
  })
})
