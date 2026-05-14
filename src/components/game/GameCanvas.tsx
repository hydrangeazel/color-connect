import { motion } from 'framer-motion'
import { Canvas } from '@/components/canvas/Canvas'
import { paintStageFoundation } from '@/engine/renderer/paintStageFoundation'
import { cn } from '@/lib/utils/cn'

export type GameCanvasProps = {
  className?: string
}

export function GameCanvas({ className }: GameCanvasProps) {
  return (
    <motion.div
      layout
      className={cn(
        'relative h-full min-h-[320px] w-full overflow-hidden rounded-[var(--radius-panel)] border border-white/5',
        'bg-surface-1/60 shadow-soft',
        className,
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18, mass: 0.8 }}
    >
      <Canvas
        onFrame={paintStageFoundation}
        aria-label="Board canvas foundation (non-interactive preview)"
      />
    </motion.div>
  )
}
