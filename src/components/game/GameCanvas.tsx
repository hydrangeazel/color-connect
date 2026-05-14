import { motion } from 'framer-motion'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas } from '@/components/canvas/Canvas'
import { mountInteractionController } from '@/engine/input'
import { createBoardFrameRenderer } from '@/engine/renderer/boardFramePipeline'
import { PHASE2_PREVIEW_NODES } from '@/game/logic/previewNodes'
import { useRendererStore } from '@/game/stores/rendererStore'
import { cn } from '@/lib/utils/cn'

export type GameCanvasProps = {
  className?: string
}

export function GameCanvas({ className }: GameCanvasProps) {
  const surfaceRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const frameRenderer = useMemo(() => createBoardFrameRenderer(PHASE2_PREVIEW_NODES), [])

  useLayoutEffect(() => {
    const surface = surfaceRef.current
    const canvas = canvasRef.current
    if (!surface || !canvas) return

    return mountInteractionController({
      target: surface,
      canvas,
      getNodes: () => PHASE2_PREVIEW_NODES,
    })
  }, [])

  useEffect(() => {
    if (!import.meta.env.DEV) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === '`') {
        useRendererStore.getState().toggleDebugOverlay()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <motion.div
      ref={surfaceRef}
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
        ref={canvasRef}
        onFrame={frameRenderer}
        aria-label="Puzzle board (interactive preview)"
      />
    </motion.div>
  )
}
