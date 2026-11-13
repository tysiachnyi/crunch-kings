# ADR 0001: Monorepo and stack

Date: 2026-11-13
Status: accepted

## Context

The game ships first as a browser demo for friends. iOS and macOS versions come later. The game is a 3D management game with a lot of UI: menus, tables, reviews, events.

## Decision

- One pnpm workspace monorepo with `apps/`, `packages/`, `prototyping/` and `assets/`.
- Runtime: TypeScript, React, React Three Fiber, drei and postprocessing, built with Vite.
- Game rules live in `packages/game-core` as pure, seeded, testable TypeScript.
- 3D assets come from Python scripts that run Blender headless and export glTF (`.glb`).
- Later, iOS and macOS wrap the web build with Capacitor or Tauri. We choose the wrapper when that work starts.

## Consequences

- Friends can play the demo from a static host with no install.
- The UI is plain React, which is fast to build for a UI-heavy tycoon game.
- Native wrappers reuse `apps/web`, but performance on older phones needs checking before release.
- We rejected Unity (large WebGL builds, slow start) and Godot (weaker web export and UI) for a browser-first game.
