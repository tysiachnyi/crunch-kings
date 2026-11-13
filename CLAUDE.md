# Crunch Kings - agent notes

Read `README.md` for the layout and the commands.

## Where code goes

- Game rules go in `packages/game-core`. Keep it pure: no React, no three.js, no DOM, no `Date.now()` or `Math.random()`. Randomness comes from `GameState.seed` through `nextRandom`, so the same seed gives the same game. Every rule change gets a Vitest test.
- Balance numbers go in `packages/game-core/src/balance.ts`, never inline in rules.
- 3D code that more than one app uses goes in `packages/scene`.
- UI and the game loop timer go in `apps/web`.
- Experiments go in a new folder under `prototyping/`. Move code into a package only when the game needs it.
- 3D assets: use the `blender-pipeline` skill.

## Done means

`pnpm typecheck` and `pnpm test` pass, and you checked the change in the browser with the preview servers `web` or `lab` from `.claude/launch.json`.

## Future platforms

iOS and macOS will wrap the same web build (see `docs/adr/0001-monorepo-and-stack.md`). Keep browser-only APIs out of `packages/*` so the wrappers can reuse them.
