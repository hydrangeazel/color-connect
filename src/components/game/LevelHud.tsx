import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState, type ComponentType } from 'react'
import { useLevelFlowStore } from '@/game/levels/progression/levelFlowStore'
import { useGameplayStore } from '@/game/stores/gameplayStore'
import { cn } from '@/lib/utils/cn'

export function LevelHud() {
  const [DevGen, setDevGen] = useState<ComponentType | null>(null)

  useEffect(() => {
    if (!import.meta.env.DEV) return
    void import('./LevelGeneratorDevTools').then((m) => setDevGen(() => m.LevelGeneratorDevTools))
  }, [])
  const title = useLevelFlowStore((s) => s.activeRecord?.title ?? 'Puzzle')
  const difficulty = useLevelFlowStore((s) => s.activeRecord?.difficulty ?? '—')
  const activeId = useLevelFlowStore((s) => s.activePuzzleId)
  const transition = useLevelFlowStore((s) => s.transition)
  const activeIndex = useLevelFlowStore((s) => s.activeIndex)
  const catalog = useLevelFlowStore((s) => s.catalog)
  const unlocked = useLevelFlowStore((s) => s.unlockedLevelIds)

  const gameplaySolved = useGameplayStore((s) => s.solved)

  const nextIndex = activeIndex + 1
  const hasNext =
    nextIndex < catalog.length && catalog[nextIndex] && unlocked.includes(catalog[nextIndex].id)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 rounded-2xl border border-cc-moss/25 bg-cc-midnight/35 px-4 py-3 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-3.5">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.3em] text-cc-moss/90">Now playing</p>
          <h2
            className="truncate text-xl font-semibold tracking-tight text-cc-beige"
            title={activeId ?? undefined}
          >
            {title}
          </h2>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-cc-beige/70">
            <span className="rounded-full border border-cc-moss/40 bg-cc-moss/15 px-2.5 py-0.5 text-[11px] font-semibold capitalize tracking-wide text-cc-beige">
              {difficulty}
            </span>
            {activeId ? (
              <span className="font-mono text-[10px] text-cc-beige/45" title="Puzzle id">
                {activeId.length > 36 ? `${activeId.slice(0, 34)}…` : activeId}
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            type="button"
            className={cn(
              'rounded-full border border-cc-beige/25 bg-cc-midnight/50 px-4 py-2 text-sm font-medium text-cc-beige',
              'shadow-sm transition hover:border-cc-moss/55 hover:bg-cc-midnight/70 hover:text-cc-beige',
            )}
            whileTap={{ scale: 0.97 }}
            onClick={() => useLevelFlowStore.getState().restartCurrentLevel()}
          >
            Reset board
          </motion.button>
          <motion.button
            type="button"
            disabled={!gameplaySolved || !hasNext}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-semibold',
              gameplaySolved && hasNext
                ? 'border-cc-moss/55 bg-cc-moss/30 text-cc-beige shadow-[0_0_20px_rgba(131,153,88,0.25)] hover:border-cc-moss/80'
                : 'cursor-not-allowed border-white/10 bg-black/25 text-cc-beige/35',
            )}
            whileTap={gameplaySolved && hasNext ? { scale: 0.97 } : undefined}
            onClick={() => {
              if (!gameplaySolved || !hasNext) return
              useLevelFlowStore.getState().advanceToNextPuzzle()
            }}
          >
            Next level
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {(transition === 'solved' || gameplaySolved) && (
          <motion.p
            key="solved"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-center text-sm font-medium text-cc-rose sm:text-left"
          >
            Lovely — partners linked and every tile filled.
          </motion.p>
        )}
      </AnimatePresence>

      {import.meta.env.DEV && DevGen ? <DevGen /> : null}
    </div>
  )
}
