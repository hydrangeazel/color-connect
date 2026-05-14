import { useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react'
import { resizeCanvasToDisplaySize } from '@/engine/renderer/canvasSizing'
import { createRenderLoop } from '@/engine/renderer/renderLoop'
import { cn } from '@/lib/utils/cn'
import type { FrameRenderFn } from '@/types/canvas'
import type { CanvasPhysicalSize } from '@/types/geometry'

export type CanvasProps = {
  className?: string
  style?: CSSProperties
  tabIndex?: number
  'aria-label'?: string
  onFrame: FrameRenderFn
}

export function Canvas({
  className,
  style,
  tabIndex = 0,
  'aria-label': ariaLabel = 'Game canvas',
  onFrame,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onFrameRef = useRef(onFrame)
  const physicalRef = useRef<CanvasPhysicalSize | null>(null)

  useLayoutEffect(() => {
    onFrameRef.current = onFrame
  }, [onFrame])

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
    })
    if (!ctx) return

    const applySize = () => {
      const rect = container.getBoundingClientRect()
      const cssWidth = rect.width
      const cssHeight = rect.height

      if (cssWidth <= 0 || cssHeight <= 0) {
        physicalRef.current = null
        return
      }

      physicalRef.current = resizeCanvasToDisplaySize(canvas, ctx, cssWidth, cssHeight)
    }

    applySize()

    const resizeObserver = new ResizeObserver(() => {
      applySize()
    })
    resizeObserver.observe(container)

    const loop = createRenderLoop(({ now, deltaMs }) => {
      const physical = physicalRef.current
      if (!physical) return

      onFrameRef.current({
        ctx,
        canvas,
        now,
        deltaMs,
        cssWidth: physical.cssWidth,
        cssHeight: physical.cssHeight,
        physical,
      })
    })

    loop.start()

    return () => {
      loop.stop()
      resizeObserver.disconnect()
      physicalRef.current = null
    }
  }, [])

  return (
    <div ref={containerRef} className={cn('relative h-full w-full', className)} style={style}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none outline-none focus-visible:ring-2 focus-visible:ring-cc-moss/60"
        tabIndex={tabIndex}
        role="img"
        aria-label={ariaLabel}
      />
    </div>
  )
}
