import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useState } from 'react'

const STORAGE_KEY = 'color-connect.dismissPlayHints'

export function PlayHints() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
    setDismissed(true)
  }, [])

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          key="hints"
          role="note"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-cc-moss/35 bg-cc-midnight/55 px-4 py-3 shadow-soft backdrop-blur sm:px-5 sm:py-4"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0 space-y-1.5 text-sm leading-relaxed text-cc-beige/95">
              <p>
                <span className="font-semibold text-cc-beige">Connect</span> each pair of dots by
                dragging along empty cells in straight lines.
              </p>
              <p className="text-cc-beige/80">
                Paths cannot cross. Fill feels best when routes stay tidy.
              </p>
            </div>
            <motion.button
              type="button"
              onClick={dismiss}
              className="shrink-0 rounded-full border border-cc-moss/45 bg-cc-moss/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-cc-beige transition hover:border-cc-moss/70 hover:bg-cc-moss/30"
              whileTap={{ scale: 0.97 }}
            >
              Got it
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
