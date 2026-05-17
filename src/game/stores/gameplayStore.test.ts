import { beforeEach, describe, expect, it } from 'vitest'

import { useGameplayStore } from '@/game/stores/gameplayStore'
import type { BoardNode } from '@/types/grid'

const mossPair: BoardNode[] = [
  { id: 'm:a', col: 1, row: 1, colorKey: 'moss' },
  { id: 'm:b', col: 4, row: 1, colorKey: 'moss' },
]

describe('useGameplayStore beginPointer', () => {
  beforeEach(() => {
    useGameplayStore.getState().initFromNodes(mossPair)
  })

  it('clears the color path when tapping an endpoint while a path exists', () => {
    useGameplayStore.setState({
      paths: {
        ...useGameplayStore.getState().paths,
        moss: [
          { col: 1, row: 1 },
          { col: 2, row: 1 },
          { col: 3, row: 1 },
        ],
      },
    })
    useGameplayStore.getState().beginPointer({ col: 4, row: 1 }, mossPair)
    expect(useGameplayStore.getState().paths.moss).toEqual([])
    expect(useGameplayStore.getState().sessionColor).toBeNull()
  })

  it('starts a new stroke from an endpoint when the path is empty', () => {
    useGameplayStore.getState().beginPointer({ col: 1, row: 1 }, mossPair)
    expect(useGameplayStore.getState().paths.moss).toEqual([{ col: 1, row: 1 }])
    expect(useGameplayStore.getState().sessionColor).toBe('moss')
  })
})
