import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas } from '@/components/canvas/Canvas'
import { mountInteractionController } from '@/engine/input'
import { createBoardFrameRenderer } from '@/engine/renderer/boardFramePipeline'
import { useLevelFlowStore } from '@/game/levels/progression/levelFlowStore'
import { useGameplayStore } from '@/game/stores/gameplayStore'
import { useRendererStore } from '@/game/stores/rendererStore'
import { cn } from '@/lib/utils/cn'

export type GameCanvasProps = {
  className?: string
}

export function GameCanvas({ className }: GameCanvasProps) {
  const surfaceRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const puzzleId = useLevelFlowStore((s) => s.activePuzzleId)
  const boardRevision = useLevelFlowStore((s) => s.boardRevision)

  const frameRenderer = useMemo(() => createBoardFrameRenderer(), [])

  useLayoutEffect(() => {
    const nodes = useLevelFlowStore.getState().boardNodes
    if (!nodes.length) return
    useGameplayStore.getState().initFromNodes(nodes)
  }, [puzzleId, boardRevision])

  useEffect(() => {
    let prevSolved = useGameplayStore.getState().solved
    return useGameplayStore.subscribe((state) => {
      if (state.solved && !prevSolved) {
        useLevelFlowStore.getState().onPuzzleSolved()
      }
      prevSolved = state.solved
    })
  }, [])

  useLayoutEffect(() => {
    const surface = surfaceRef.current
    const canvas = canvasRef.current
    if (!surface || !canvas) return

    return mountInteractionController({
      target: surface,
      canvas,
      getNodes: () => useLevelFlowStore.getState().boardNodes,
    })
  }, [])

  useEffect(() => {
    if (!import.meta.env.DEV) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === '`') {
        useRendererStore.getState().toggleDebugOverlay()
      }
      if (event.key === 'r' || event.key === 'R') {
        useGameplayStore.getState().resetRound()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={puzzleId ?? 'boot'}
        className="h-full w-full"
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.99 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
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
          <Canvas ref={canvasRef} onFrame={frameRenderer} aria-label="Color Connect puzzle board" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
