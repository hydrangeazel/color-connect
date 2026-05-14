import { computeBoardLayout } from '@/engine/grid'
import { useBoardStore } from '@/game/stores/boardStore'
import { useGameplayStore } from '@/game/stores/gameplayStore'
import { useInteractionStore } from '@/game/stores/interactionStore'
import { useLevelFlowStore } from '@/game/levels/progression/levelFlowStore'
import { useRendererStore } from '@/game/stores/rendererStore'
import type { CcColorKey } from '@/lib/palette'
import type { FrameRenderFn } from '@/types/canvas'

import { renderBackground } from './backgroundRenderer'
import { renderBoard } from './boardRenderer'
import { renderDebugOverlay } from './debugRenderer'
import { renderNodes } from './nodeRenderer'
import { renderPaths } from './pathRenderer'

/**
 * Single entry draw pass for the interactive board.
 * Reads interaction/renderer/gameplay/level snapshots via `getState` to avoid React subscriptions on hot paths.
 */
export function createBoardFrameRenderer(): FrameRenderFn {
  let fpsSmoothed = 0

  return (context) => {
    const { cssWidth, cssHeight, now, deltaMs } = context
    const layout = computeBoardLayout(cssWidth, cssHeight)

    useBoardStore.getState().setLayout(layout)

    const interaction = useInteractionStore.getState()
    const renderer = useRendererStore.getState()
    const gameplay = useGameplayStore.getState()
    const level = useLevelFlowStore.getState()
    const nodes = level.boardNodes

    const instFps = deltaMs > 0 ? 1000 / deltaMs : 0
    fpsSmoothed = fpsSmoothed === 0 ? instFps : fpsSmoothed * 0.9 + instFps * 0.1

    const colorOrder = Object.keys(gameplay.pairByColor) as CcColorKey[]

    renderBackground(context)
    renderBoard(context, {
      layout,
      hoverCell: interaction.hoverCell,
      now,
      solved: gameplay.solved,
      solvedAtMs: gameplay.solvedAtMs,
    })
    renderPaths(context, {
      layout,
      paths: gameplay.paths,
      sessionColor: gameplay.sessionColor,
      colorOrder,
      now,
      solved: gameplay.solved,
      solvedAtMs: gameplay.solvedAtMs,
    })
    renderNodes(context, {
      layout,
      nodes,
      hoverCell: interaction.hoverCell,
      selectedNodeId: interaction.selectedNodeId,
      now,
      solved: gameplay.solved,
      solvedAtMs: gameplay.solvedAtMs,
    })

    if (import.meta.env.DEV && renderer.debugOverlay) {
      const g = useGameplayStore.getState()
      const lv = useLevelFlowStore.getState()
      const started = lv.levelStartedAt
      renderDebugOverlay(context, {
        layout,
        hoverCell: interaction.hoverCell,
        fps: fpsSmoothed,
        pointerPhase: interaction.pointerPhase,
        dragging: interaction.pointerPhase === 'dragging',
        gameplay: {
          paths: g.paths,
          sessionColor: g.sessionColor,
          solved: g.solved,
          lastPathLint: g.lastPathLint,
          pairByColor: g.pairByColor,
        },
        level: {
          puzzleId: lv.activePuzzleId,
          title: lv.activeRecord?.title ?? '—',
          difficulty: lv.activeRecord?.difficulty ?? '—',
          transition: lv.transition,
          activeIndex: lv.activeIndex,
          catalogLen: lv.catalog.length,
          unlocked: lv.unlockedLevelIds.length,
          solvedProgress: lv.solvedLevelIds.length,
          levelStartedAt: started,
          elapsedMs: started ? now - started : null,
        },
      })
    }
  }
}
