# Crunch Kings

A cozy 3D tycoon game about running a game studio. You hire weird people, ship games, fight rivals, enter competitions and survive angry fans.

The demo covers the garage years, 1980-1989: you, one garage friend, $20,000, and ten years to make a name.

The first target is the browser, so friends can play a demo. iOS and macOS come later.

## Repository layout

| Folder | What it holds |
| --- | --- |
| `apps/web` | The playable browser game: Vite, React, React Three Fiber, HUD. |
| `packages/game-core` | Game rules as pure TypeScript: calendar, staff, projects, reviews, sales, rivals, awards, fans, events, contracts, research. Numbers live in `balance.ts`, content tables in `content.ts`. No rendering. Vitest tests, and `testkit.ts` with a bot that plays the whole demo. |
| `packages/scene` | The shared 3D office: the garage and the small office, characters in seats with simple animation, isometric camera, lights, post effects, click selection. |
| `prototyping/` | Experiments and test benches. They are not part of the shipped game. |
| `prototyping/scene-viewer` | Shows the office model with a free orbit camera, to check new assets. |
| `assets/blender` | Python scripts that build every 3D asset in Blender. They are the source of truth for models. |
| `assets/public` | Files that the apps serve as-is: `models/stage1.glb` (garage), `models/stage2.glb` (small office), `models/characters.glb`. Both apps use this folder as `publicDir`. |
| `assets/renders` | Preview renders from Blender. |
| `docs/adr` | Architecture decision records. |

The dependency direction is `apps/*` and `prototyping/*` → `packages/scene` and `packages/game-core`. The packages never import from an app.

## Commands

Run every command from the repository root.

```bash
pnpm install
```

```bash
pnpm dev
```

This starts the game at http://localhost:5173.

```bash
pnpm lab
```

This starts the scene viewer at http://localhost:5174.

```bash
pnpm test
```

```bash
pnpm typecheck
```

```bash
pnpm scene
```

This rebuilds the characters, the garage and the small office in Blender, exports and compresses the `.glb` files and renders previews. It needs Blender at `/Applications/Blender.app` (or set `BLENDER`). Add `--no-render` to skip the renders.

```bash
pnpm build
```

This builds the game into `apps/web/dist`. The output is a static site, so any static host can serve the demo.

## Requirements

- Node 22 or later, pnpm 11.
- Blender 5.x, only to change 3D assets.
