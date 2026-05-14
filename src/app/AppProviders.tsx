import { MotionConfig } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'
import { useSettingsStore } from '@/game/stores'

export function AppProviders({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useSettingsStore((s) => s.prefersReducedMotion)
  const setPrefersReducedMotion = useSettingsStore((s) => s.setPrefersReducedMotion)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setPrefersReducedMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [setPrefersReducedMotion])

  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? 'always' : 'user'}>{children}</MotionConfig>
  )
}
