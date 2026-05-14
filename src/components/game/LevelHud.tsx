import { AnimatePresence, motion } from 'framer-motion'
import { useLevelFlowStore } from '@/game/levels/progression/levelFlowStore'
import { useGameplayStore } from '@/game/stores/gameplayStore'
import { cn } from '@/lib/utils/cn'

export function LevelHud() {
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
      <div className="flex flex-col gap-3 rounded-[var(--radius-panel)] border border-white/5 bg-surface-1/55 p-4 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.28em] text-cc-moss/80">Level</p>
          <h2 className="truncate text-lg font-semibold text-cc-beige">{title}</h2>
          <p className="mt-1 text-xs text-cc-beige/60">
            <span className="rounded-full border border-white/10 bg-black/15 px-2 py-0.5 capitalize text-cc-moss/90">
              {difficulty}
            </span>
            <span className="ml-2 font-mono text-[11px] text-cc-beige/45">{activeId}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            type="button"
            className={cn(
              'rounded-full border border-white/10 bg-cc-midnight/40 px-4 py-2 text-sm text-cc-beige/90',
              'transition hover:border-cc-moss/40 hover:bg-cc-midnight/55',
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
              'rounded-full border px-4 py-2 text-sm',
              gameplaySolved && hasNext
                ? 'border-cc-moss/50 bg-cc-moss/25 text-cc-beige'
                : 'cursor-not-allowed border-white/5 bg-black/20 text-cc-beige/35',
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
            Puzzle solved — gentle momentum carries the moss glow.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
