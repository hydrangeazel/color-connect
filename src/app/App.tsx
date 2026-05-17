import { useLayoutEffect, useRef } from 'react'
import { GameBootstrap } from '@/app/GameBootstrap'
import { AppProviders } from '@/app/AppProviders'
import { GameCanvas } from '@/components/game/GameCanvas'
import { LevelHud } from '@/components/game/LevelHud'
import { PlayHints } from '@/components/game/PlayHints'
import { env } from '@/lib/env'
import { useLevelFlowStore } from '@/game/levels/progression/levelFlowStore'
import { useGameStore } from '@/game/stores'

function ShellChrome() {
  const phase = useGameStore((s) => s.phase)
  const didBootstrap = useRef(false)

  useLayoutEffect(() => {
    if (didBootstrap.current) return
    didBootstrap.current = true
    useLevelFlowStore.getState().bootstrapBuiltinCatalog()
  }, [])

  return (
    <div className="flex min-h-full flex-col">
      <header className="mx-auto w-full max-w-6xl px-4 pb-2 pt-8 sm:px-6 sm:pb-4 sm:pt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-cc-moss/90">Puzzle</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-cc-beige sm:text-4xl">
              {env.appName}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-cc-beige/80">
              Calm paths through the moss grid — connect every pair without crossing lines.
            </p>
          </div>
          <p className="hidden text-right text-[11px] text-cc-beige/45 sm:block">
            <span className="text-cc-moss/90">State</span> · {phase}
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 pb-10 sm:gap-5 sm:px-6 sm:pb-12">
        <PlayHints />
        <LevelHud />

        <section className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_min(240px,28vw)] lg:items-start lg:gap-8">
          <div className="order-1 flex min-h-[min(72vh,640px)] flex-col lg:order-none">
            <div className="relative flex flex-1 items-stretch justify-center rounded-2xl border border-cc-moss/30 bg-gradient-to-b from-cc-midnight/25 via-black/20 to-cc-forest/40 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-3 md:p-4">
              <div className="flex w-full max-w-[min(100%,720px)] flex-1 flex-col self-center">
                <GameCanvas className="min-h-[min(68vh,600px)] flex-1" />
              </div>
            </div>
          </div>

          <aside className="order-2 flex flex-col gap-3 rounded-2xl border border-white/10 bg-cc-midnight/25 p-4 text-sm text-cc-beige/75 shadow-soft backdrop-blur lg:sticky lg:top-6 lg:self-start">
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-cc-moss/85">About</p>
              <h2 className="mt-1.5 text-base font-semibold text-cc-beige">
                Hand-crafted and generated
              </h2>
              <p className="mt-2 leading-relaxed text-cc-beige/70">
                Levels ship as data. Your progress saves locally. Optional procedural seeds reuse
                the same validation path as authored puzzles.
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-black/20 p-3 text-xs leading-relaxed text-cc-beige/60">
              Tip: drag from a colored dot. Tracing over another color blocks the path — lift and
              try another route.
            </div>
          </aside>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-black/25 py-5 text-center text-[11px] text-cc-beige/50">
        {new Date().getFullYear()} · {env.appName}
        {import.meta.env.DEV ? (
          <span className="ml-2 text-cc-beige/35">· ` debug · Shift+` details + hit rings</span>
        ) : null}
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
