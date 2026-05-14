import { useEffect, type ReactNode } from 'react'
import { useGameStore } from '@/game/stores'

export function GameBootstrap({ children }: { children: ReactNode }) {
  const setPhase = useGameStore((s) => s.setPhase)

  useEffect(() => {
    setPhase('ready')
  }, [setPhase])

  return children
}
