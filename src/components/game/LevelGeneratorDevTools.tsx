import { AnimatePresence, motion } from 'framer-motion'
import { useGenerationDevStore } from '@/game/generation/debug/generationDevStore'
import type { PuzzleDifficulty } from '@/game/levels/schemas/puzzleRecord'
import { cn } from '@/lib/utils/cn'
import { useState } from 'react'

const TIERS: PuzzleDifficulty[] = ['beginner', 'intermediate', 'advanced', 'expert']

export function LevelGeneratorDevTools() {
  const [open, setOpen] = useState(false)
  const [seed, setSeed] = useState('phase5-demo-seed')
  const [tier, setTier] = useState<PuzzleDifficulty>('intermediate')
  const isGenerating = useGenerationDevStore((s) => s.isGenerating)
  const lastError = useGenerationDevStore((s) => s.lastError)
  const diagnostics = useGenerationDevStore((s) => s.lastDiagnostics)

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20 text-sm text-cc-beige/80 backdrop-blur">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium uppercase tracking-[0.22em] text-cc-moss/90 transition hover:bg-white/5"
      >
        <span>Generator (dev)</span>
        <span className="text-cc-beige/50">{open ? '−' : '+'}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-white/5"
          >
            <div className="space-y-3 p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <label className="flex min-w-[180px] flex-1 flex-col gap-1 text-[11px] text-cc-beige/55">
                  Seed
                  <input
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                    className="rounded-lg border border-white/12 bg-cc-midnight/40 px-3 py-2 font-mono text-[12px] text-cc-beige outline-none ring-cc-moss/30 focus:border-cc-moss/50 focus:ring-2"
                    spellCheck={false}
                  />
                </label>
                <label className="flex flex-col gap-1 text-[11px] text-cc-beige/55">
                  Tier
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as PuzzleDifficulty)}
                    className="rounded-lg border border-white/12 bg-cc-midnight/40 px-3 py-2 text-cc-beige outline-none focus:border-cc-moss/50"
                  >
                    {TIERS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                <motion.button
                  type="button"
                  disabled={isGenerating || !seed.trim()}
                  className={cn(
                    'rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide',
                    isGenerating || !seed.trim()
                      ? 'cursor-not-allowed border-white/5 bg-black/30 text-cc-beige/35'
                      : 'border-cc-moss/50 bg-cc-moss/25 text-cc-beige hover:border-cc-moss/70',
                  )}
                  whileTap={!isGenerating && seed.trim() ? { scale: 0.97 } : undefined}
                  onClick={() =>
                    void useGenerationDevStore.getState().generateAndPlay(seed.trim(), tier)
                  }
                >
                  {isGenerating ? '…' : 'Generate'}
                </motion.button>
              </div>
              {lastError ? <p className="text-[11px] text-cc-rose/90">{lastError}</p> : null}
              {diagnostics?.length ? (
                <pre className="max-h-20 overflow-auto rounded-lg border border-white/5 bg-black/30 p-2 font-mono text-[9px] leading-relaxed text-cc-beige/55">
                  {diagnostics.join('\n')}
                </pre>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
