# Crunchy Fellos

A cozy 3D tycoon game about running a game studio. You hire weird people, ship games, fight rivals, enter competitions and survive angry fans.

The first target is the browser, so friends can play a demo. iOS and macOS come later.

## Repository layout

| Folder | What it holds |
| --- | --- |
| `apps/web` | The playable browser game: Vite, React, React Three Fiber, HUD. |
| `packages/game-core` | Game rules as pure TypeScript: studio, staff, projects, releases, balance. No rendering. Vitest tests. |
| `packages/scene` | The shared 3D office: model loading, isometric camera, lights, post effects, click selection. |
| `prototyping/` | Experiments and test benches. They are not part of the shipped game. |
| `prototyping/scene-viewer` | Shows the office model with a free orbit camera, to check new assets. |
| `assets/blender` | Python scripts that build every 3D asset in Blender. They are the source of truth for models. |
| `assets/public` | Files that the apps serve as-is, for example `models/stage1.glb`. Both apps use this folder as `publicDir`. |
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

This rebuilds the 3D office in Blender, exports `assets/public/models/stage1.glb` and renders previews. It needs Blender at `/Applications/Blender.app`. Add `-- --no-render` to skip the renders.

```bash
pnpm build
```

This builds the game into `apps/web/dist`. The output is a static site, so any static host can serve the demo.

## Requirements

- Node 22 or later, pnpm 11.
- Blender 5.x, only to change 3D assets.
