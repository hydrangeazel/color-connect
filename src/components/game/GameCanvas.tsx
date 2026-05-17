import { AnimatePresence, motion } from 'framer-motion'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from 'react'
import { Canvas } from '@/components/canvas/Canvas'
import { mountInteractionController } from '@/engine/input'
import { createBoardFrameRenderer } from '@/engine/renderer/boardFramePipeline'
import { useLevelFlowStore } from '@/game/levels/progression/levelFlowStore'
import { useGameplayStore } from '@/game/stores/gameplayStore'
import { useInteractionStore } from '@/game/stores/interactionStore'
import { useRendererStore } from '@/game/stores/rendererStore'
import { cn } from '@/lib/utils/cn'

export type GameCanvasProps = {
  className?: string
}

export function GameCanvas({ className }: GameCanvasProps) {
  const surfaceRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const interactionUnmountRef = useRef<(() => void) | null>(null)
  const [GenOverlay, setGenOverlay] = useState<ComponentType | null>(null)

  const puzzleId = useLevelFlowStore((s) => s.activePuzzleId)
  const boardRevision = useLevelFlowStore((s) => s.boardRevision)

  const frameRenderer = useMemo(() => createBoardFrameRenderer(), [])

  useEffect(() => {
    if (!import.meta.env.DEV) return
    void import('./CanvasGenerationOverlay').then((m) =>
      setGenOverlay(() => m.CanvasGenerationOverlay),
    )
  }, [])

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

  /**
   * The board `<canvas>` is recreated whenever the keyed `motion.div` remounts (puzzle / revision).
   * A one-shot `useLayoutEffect([])` left pointer listeners on a detached node — bind per canvas instance.
   */
  const bindCanvasRef = useCallback((el: HTMLCanvasElement | null) => {
    interactionUnmountRef.current?.()
    interactionUnmountRef.current = null
    canvasRef.current = el
    if (el) {
      interactionUnmountRef.current = mountInteractionController({
        target: el,
        canvas: el,
        getNodes: () => useLevelFlowStore.getState().boardNodes,
      })
    }
  }, [])

  useEffect(() => {
    const paintCursor = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const s = useInteractionStore.getState()
      const nodes = useLevelFlowStore.getState().boardNodes
      const hc = s.hoverCell
      const over = hc && nodes.some((n) => n.col === hc.col && n.row === hc.row)
      if (s.pointerPhase === 'dragging') {
        canvas.style.cursor = 'grabbing'
      } else if (over) {
        canvas.style.cursor = 'pointer'
      } else {
        canvas.style.cursor = 'grab'
      }
    }

    paintCursor()
    const unsubInteraction = useInteractionStore.subscribe(paintCursor)
    const unsubLevel = useLevelFlowStore.subscribe(paintCursor)
    return () => {
      unsubInteraction()
      unsubLevel()
      const c = canvasRef.current
      if (c) c.style.cursor = ''
    }
  }, [])

  useEffect(() => {
    if (!import.meta.env.DEV) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === '`') {
        event.preventDefault()
        if (event.shiftKey) {
          useRendererStore.getState().toggleDebugVerbose()
        } else {
          useRendererStore.getState().toggleDebugOverlay()
        }
      }
      if (event.key === 'r' || event.key === 'R') {
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        ) {
          return
        }
        useGameplayStore.getState().resetRound()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${puzzleId ?? 'boot'}:${boardRevision}`}
        className="h-full w-full"
        initial={{ opacity: 0, scale: 0.988 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.992 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          ref={surfaceRef}
          layout
          className={cn(
            'relative h-full min-h-[280px] w-full overflow-hidden rounded-[var(--radius-panel)]',
            'border border-cc-moss/35 bg-surface-1/85 shadow-[0_0_0_1px_rgba(247,244,213,0.06),var(--shadow-soft)]',
            'touch-manipulation select-none',
            className,
          )}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 140, damping: 20, mass: 0.75 }}
        >
          {GenOverlay ? <GenOverlay /> : null}
          <Canvas ref={bindCanvasRef} onFrame={frameRenderer} aria-label="Color Connect puzzle board" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
