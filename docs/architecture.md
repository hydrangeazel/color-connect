# Architecture

Color Connect separates **React as a shell** from **imperative game time**. The goal is predictable performance, testable systems, and a codebase that scales toward procedural content, replays, and online services without rewrites.

## Layers

### Application (`src/app`)

Hosts providers, routing (future), and layout chrome. `AppProviders` wires Framer Motion’s `MotionConfig` to the settings store and syncs OS `prefers-reduced-motion` signals.

### Presentation (`src/components`)

- `canvas` owns the DOM surface for WebGL/Canvas2D hosts.
- `game` composes gameplay-facing UI around engine hooks (future).
- `ui` and `effects` are reserved for design system primitives and ambient treatments.

### Engine (`src/engine`)

Low-level, framework-agnostic building blocks:

- `renderer` — RAF loop, sizing, layered draw passes (`backgroundRenderer`, `boardRenderer`, `nodeRenderer`, optional `debugRenderer`) composed by `createBoardFrameRenderer`.
- `grid` — responsive 8×8 layout math plus pixel↔cell mapping shared by input and renderers.
- `input` — pointer sessions (`mountPointerSession`), coordinate conversion, and `mountInteractionController` bridging DOM events to stores without React subscriptions.
- `animation` and `audio` remain reserved for tween timelines and Web Audio graphs.

### Game domain (`src/game`)

Gameplay-specific rules, data, and orchestration live here. `stores` exposes Zustand slices that will later drive HUD, settings persistence, and audio buses. Logic stays out of the canvas component to avoid mega-files.

### Shared (`src/lib`, `src/types`, `src/services`)

Cross-cutting helpers, shared contracts, and future API clients.

## Rendering model

1. `Canvas` measures its container with `ResizeObserver`.
2. Backing store dimensions follow CSS size × `devicePixelRatio` (capped for sanity).
3. `createRenderLoop` schedules `requestAnimationFrame` callbacks outside React.
4. Draw functions receive a `FrameRenderContext` with stable coordinate semantics (CSS space via transforms).

React only mounts/unmounts the loop and forwards the latest draw closure through a ref, preventing render-driven animation.

## State management

Zustand slices are intentionally granular (`game`, `settings`, `audio`, `ui`, `board`, `interaction`, `renderer`) so future persistence, telemetry, and multiplayer can subscribe to narrow surfaces without prop drilling.

**Phase 2 hot path:** pointer move / frame paint reads interaction + renderer snapshots through `getState()` inside the RAF callback and pointer session handlers. React components avoid selectors on high-churn fields (hover cell, pointer phase) so reconciliation stays cold while the canvas stays hot.

## Phase 2 interactive surface

- **Grid** — `computeBoardLayout` fits an 8×8 board inside the canvas with equal padding, preserving a square aspect ratio at any viewport size (DPR still handled in `Canvas`).
- **Render pipeline** — `createBoardFrameRenderer` sequences background → board chrome → nodes → optional dev overlay. Each pass receives explicit options objects to keep functions pure and testable.
- **Input** — `mountInteractionController` listens on the board surface, converts client coordinates through `clientToCanvasLocal`, maps to cells via `canvasPointToCell`, promotes drags after a small pixel threshold, and records clicks for endpoint selection (no path rules yet).

## Styling system

Tailwind CSS v4 reads tokens from `src/styles/theme.css` (`@theme`). Semantic aliases (`surface-*`, `glow-*`) keep JSX readable while preserving the moss-and-midnight palette.

## Deployment

Vercel runs `npm run build` with the default Vite output (`dist`). No backend is provisioned yet.
