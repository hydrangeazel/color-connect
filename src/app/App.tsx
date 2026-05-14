import { motion } from 'framer-motion'
import { GameBootstrap } from '@/app/GameBootstrap'
import { AppProviders } from '@/app/AppProviders'
import { GameCanvas } from '@/components/game/GameCanvas'
import { env } from '@/lib/env'
import { useGameStore } from '@/game/stores'

function ShellChrome() {
  const phase = useGameStore((s) => s.phase)

  return (
    <div className="flex min-h-full flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-8">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cc-moss/80">
            Phase 3 · Gameplay core
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-cc-beige sm:text-4xl">{env.appName}</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-cc-beige/70">
            Drag from any colored dot to paint orthogonal paths, rewind by doubling back, and
            complete every pair to solve. Logic runs in Zustand + pure pathing helpers; React never
            tracks pointer deltas.
          </p>
        </div>
        <div className="hidden text-right text-xs text-cc-beige/60 sm:block">
          <p className="font-medium text-cc-moss">Engine</p>
          <p className="mt-1">Lifecycle: {phase}</p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 pb-12">
        <section className="grid flex-1 gap-6 lg:grid-cols-[1.1fr_0.45fr]">
          <GameCanvas className="min-h-[420px] lg:min-h-[520px]" />

          <aside className="flex flex-col gap-4 rounded-[var(--radius-panel)] border border-white/5 bg-surface-1/70 p-6 shadow-soft backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cc-moss/80">Gameplay</p>
              <h2 className="mt-2 text-xl font-semibold text-cc-beige">Path intelligence</h2>
              <p className="mt-2 text-sm leading-relaxed text-cc-beige/70">
                Occupancy-aware extensions, truncation, cross-color blocking, and win detection. Dev
                overlay shows lint + occupancy; press R to reset paths.
              </p>
            </div>

            <motion.div
              className="mt-auto rounded-2xl border border-cc-moss/25 bg-cc-midnight/35 p-4 text-sm text-cc-beige/80"
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.6 }}
            >
              <p className="font-medium text-cc-rose">Upcoming</p>
              <p className="mt-2 leading-relaxed">
                Path rendering, collision rules, procedural levels, and cloud saves stack on this
                interactive core.
              </p>
            </motion.div>
          </aside>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-black/20 py-6 text-center text-xs text-cc-beige/50">
        Crafted for calm sessions · {new Date().getFullYear()} · {env.appName}
      </footer>
    </div>
  )
}

export function App() {
  return (
    <AppProviders>
      <GameBootstrap>
        <ShellChrome />
      </GameBootstrap>
    </AppProviders>
  )
}
