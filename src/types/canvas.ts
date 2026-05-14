import type { CanvasPhysicalSize } from '@/types/geometry'

export type FrameRenderContext = {
  ctx: CanvasRenderingContext2D
  canvas: HTMLCanvasElement
  now: number
  deltaMs: number
  cssWidth: number
  cssHeight: number
  physical: CanvasPhysicalSize
}

export type FrameRenderFn = (context: FrameRenderContext) => void
