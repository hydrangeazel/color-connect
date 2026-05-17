import { AnimatePresence, motion } from 'framer-motion'
import { useGenerationDevStore } from '@/game/generation/debug/generationDevStore'

export function CanvasGenerationOverlay() {
  const busy = useGenerationDevStore((s) => s.isGenerating)

  return (
    <AnimatePresence>
      {busy ? (
        <motion.div
          key="gen"
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-cc-midnight/35 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.p
            className="rounded-full border border-white/10 bg-black/30 px-5 py-2 text-xs font-medium tracking-wide text-cc-beige/90"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4 }}
          >
            Weaving paths…
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
