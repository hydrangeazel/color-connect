# Color Connect

Browser-native puzzle experience inspired by Flow Free — calm, moss-lit, and canvas-driven. The repo ships **through Phase 5**: foundation through catalog/progression/saves **plus** a **deterministic procedural generator** (seeded RNG, quality scoring, solver helpers, and dev-only generate/play tooling). See `docs/architecture.md`.

## Highlights

- Vite + React 19 + TypeScript with strict compiler settings
- Tailwind CSS v4 design tokens for the cozy palette
- Zustand store slices for gameplay, settings, level flow, and HUD-adjacent state
- Framer Motion wired through `MotionConfig` with OS reduced-motion sync
- Canvas host with RAF loop, DPR-aware sizing, ResizeObserver sync, and strict cleanup
- ESLint + Prettier + GitHub Actions CI

## Stack

| Area        | Choice                                      |
| ----------- | ------------------------------------------- |
| Tooling     | Vite 8, TypeScript 6                        |
| UI          | React 19, Tailwind CSS v4, Framer Motion 12 |
| State       | Zustand 5                                   |
| Rendering   | Canvas2D foundation (WebGPU later-ready)    |
| Deploy      | Vercel                                      |
| Future APIs | Fastify, PostgreSQL, Prisma, Redis          |

## Architecture

See [`docs/architecture.md`](./docs/architecture.md) for the layering model, rendering loop boundaries, and state management guidelines.

At a glance:

- `src/app` — providers, shell layout, bootstrap hooks
- `src/components` — canvas host, gameplay composition, UI kit (growing)
- `src/engine` — renderer, input, animation, audio infrastructure
- `src/game` — rules, levels, systems, hooks, and Zustand stores
- `src/lib` + `src/types` — shared utilities and contracts

## Palette

| Token          | Hex       | Usage                            |
| -------------- | --------- | -------------------------------- |
| Dark Green     | `#0A3323` | Deep atmosphere, primary surface |
| Moss Green     | `#839958` | Accents, highlights              |
| Beige          | `#F7F4D5` | Typography, soft contrast        |
| Rosy Brown     | `#D3968C` | Warm punctuation                 |
| Midnight Green | `#105666` | Mid-tones, panels                |

## Getting started

```bash
git clone https://github.com/<your-org>/color-connect.git
cd color-connect
npm install
npm run dev
```

### Scripts

| Script                 | Purpose                      |
| ---------------------- | ---------------------------- |
| `npm run dev`          | Local development server     |
| `npm run build`        | Production bundle            |
| `npm run preview`      | Preview the production build |
| `npm run lint`         | ESLint                       |
| `npm run format`       | Prettier write               |
| `npm run format:check` | Prettier check               |
| `npm run typecheck`    | Project references build     |
| `npm run test`         | Vitest unit tests            |
| `npm run test:watch`   | Vitest watch mode            |

### Environment

Copy `.env.example` to `.env` and adjust optional branding:

```
VITE_APP_NAME=Color Connect
```

## Performance notes

- The animation loop is **not** tied to React renders. React supplies the surface once; the loop reads sizing refs and invokes draw closures imperatively.
- Canvas backing stores respect `devicePixelRatio` with a conservative cap to balance sharpness and fill-rate.
- Context creation requests `desynchronized: true` where supported to hint low-latency compositing.

## Roadmap

### Shipped (Phases 1–5)

- Canvas RAF pipeline, grid layout, pointer routing, path mutation, completion, and dev overlay
- `PuzzleRecordV1` content format, builtin registry, validation, loaders, `useLevelFlowStore`, and `SaveFileV1` persistence
- Deterministic procedural generator (`game/generation`) with seeded RNG, quality gates, solver helpers, and dev-only generate/play tooling

### Next

- Remote catalogs, daily puzzles, and procedural seeds (same loader boundary)
- Replay buffer and analytics hooks
- Optional backend: Fastify, Prisma, PostgreSQL, Redis for accounts and cloud sync

## Contributing

Issues and PRs welcome. Please run `npm run test`, `npm run lint`, and `npm run format:check` before submitting. CI mirrors those commands.

## License

MIT — update if you prefer a different license for portfolio usage.
