# Architecture

## Stack

| Part | Tool |
| --- | --- |
| Workspace | pnpm 11 monorepo |
| Language | TypeScript 7, strict, `noUncheckedIndexedAccess` |
| UI | React 19 |
| 3D in the browser | three.js 0.187, React Three Fiber 9, drei 10, postprocessing |
| Build | Vite 8 |
| Tests | Vitest 5 |
| 3D assets | Blender 5 run headless with Python, export to glTF (`.glb`), meshopt compression with `gltf-transform` |

Packages export raw TypeScript (`"exports": {".": "./src/index.ts"}`). There is no build step for packages.

## Folders

| Folder | Role |
| --- | --- |
| `apps/web` | The playable browser game. It owns the game loop timer, the save file, the UI and the sounds. |
| `packages/game-core` | All game rules. Pure TypeScript. |
| `packages/scene` | The shared 3D office: stages, characters, camera, lights, post effects, click selection. |
| `prototyping/scene-viewer` | A test bench with a free orbit camera, to look at models. |
| `assets/blender` | Python scripts that build every model. They are the source of truth for 3D. |
| `assets/public` | Files served as-is. Both apps use it as the Vite `publicDir`. |
| `assets/renders` | Preview renders from Blender. |
| `docs` | ADRs, design notes and this wiki. |

Dependency direction: `apps/*` and `prototyping/*` import `packages/*`. A package never imports an app.

## Data flow

```
apps/web (timer, UI) ──calls──▶ game-core (pure rules) ──returns──▶ new GameState
        │                                                            │
        └──passes office, people, working, crunch──▶ packages/scene ◀─┘
```

1. `GameState` is one plain JSON object. It holds everything about a run.
2. Every rule is a function `(state, ...args) => newState`. Rules never change the old state.
3. `apps/web/src/useGame.ts` runs a timer. Each tick calls `advanceWeek(state)`.
4. Player actions (start a game project, hire, research) go through `act(change)` in `useGame.ts`. A rule that is not allowed throws an `Error`. The UI shows its message as a toast.
5. The time stops while a pending event waits for a choice, while the release day screen is open, and after an ending.
6. The save file is `GameState` as JSON in `localStorage` under `crunch-kings/save-v3`. A save with another `version` is ignored.

## Determinism

`game-core` never uses `Math.random()` or `Date.now()`. Randomness comes from `GameState.seed` through `createRng(seed)` in `rng.ts`. Each step stores the new seed back in the state. The same seed and the same player actions give the same run. Only `apps/web` picks a new seed (from the clock) when a studio is founded.

## game-core modules

| File | Holds |
| --- | --- |
| `types.ts` | Every type of the game state. |
| `balance.ts` | Every tuning number. Rules never hold inline numbers. |
| `content.ts` | Content tables: genres, topics, platforms, engines, research nodes, traits, outlets, review quotes, names, rivals, petitions, letters. |
| `calendar.ts` | Week number to year, month and date label. |
| `rng.ts` | The seeded random number generator. |
| `game.ts` | `createNewGame`, `advanceWeek` (the weekly order of all systems), `resolveEvent`. |
| `founders.ts` | Founders and garage friends. |
| `staff.ts` | Candidates, hiring, firing, training, morale, stress, burnout, raises, monthly costs. |
| `project.ts` | Game project start, weekly work, quality, crunch, ad campaigns, dev diary. |
| `market.ts` | Release, reviews, sales, chart rank, rivals, awards show. |
| `fans.ts` | Fan mood, demands, petitions, review bombs, letters. |
| `events.ts` | Random events, scheduled story beats, game jam, rescue ladder, event choices. |
| `business.ts` | Contracts, research, licenses, office moves, milestones, year end. |
| `util.ts` | Small helpers: log, money format, inflation, clamp, ids. |
| `testkit.ts` | Test helpers and a bot (`autoplay`) that plays the whole demo. |

The weekly order inside `advanceWeek` is: demo end check → work on the game project or contract → research points → team morale and stress → sales income → hype decay → modifiers tick → monthly costs, candidates and contracts → year end and yearly rivals → weekly rivals → nominations (week 48) → awards show (week 50) → fans → events → milestones.

## packages/scene

- `OfficeCanvas` takes `office`, `people`, `working`, `crunch` and `onSelect`.
- `Stage` loads the stage model for the office level and `characters.glb`. It clones one character into each `Seat_NN` node and animates head and arms.
- `OfficeCamera` is a fixed isometric orthographic camera. The view width depends on the office level.
- `OfficeLights` has one light set per office level.

## apps/web

- `useGame.ts`: state, timer, speed, save, sounds on game changes, `act`, `choose`, `quit`.
- `App.tsx`: title menu, setup, HUD, side panel tabs, log, modals, keyboard.
- `ui/ProjectPanel.tsx`, `ui/Panels.tsx`, `ui/Modals.tsx`, `ui/Tutorial.tsx`.
- `sound.ts`: UI sounds made with WebAudio oscillators. No audio files.
