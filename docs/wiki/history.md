# History

Newest first. Add a line here when you finish a piece of work.

## 2026-11-13: the garage years demo

Commit `2e38d08` on branch `feat/garage-years-demo`.

- Rewrote `game-core` for the bible systems of the 1980s: six skills, eight traits, morale and burnout, hiring, training, contracts, research, licenses, engines, offices, reviews, sales, rivals, awards, game jam, angry fans, events, rescue ladder, milestones, demo ending.
- Balanced the economy with a bot that plays the full demo (`testkit.ts`). The first balance let fans and sales grow without limit, and a smart bot ended with billions. Fixes: a square-root fan bonus with a cap, an audience cap on units, a faster quality bar, higher salaries and yearly raises.
- Added 47 Vitest tests across `game.test.ts`, `fans.test.ts`, `market.test.ts`, `staff.test.ts`, `business.test.ts` and `events.test.ts`.
- Built the full browser UI: title menu, setup, HUD, eight tabs, release day, events, ending, tips, keys, UI sounds.
- Moved characters out of the stages into `characters.glb` with 11 looks and animatable head and arms. Stages now have `Seat_NN` nodes.
- Added the small office stage (`stage2.glb`).
- Added meshopt compression. The models went from 7.1 MB to 2.1 MB.
- Owner choices for this work: a fixed $20,000 start, UI sounds only, invented platform names.

## 2026-11-13: the bible and two people

- Read the game bible and gave an opinion. The owner's decisions are in [ADR 0002](../adr/0002-bible-decisions.md).
- Renamed Crunchy Fellos to Crunch Kings in code and docs. The repository folder keeps the old name.
- Wrote the angry fans design note.
- Made the demo start with two people: the founder and the garage friend, picked by archetype.

## 2026-11-13: monorepo and first playable office

Commit `40667b4`.

- Set up the pnpm monorepo, the stack and the `prototyping/` folder ([ADR 0001](../adr/0001-monorepo-and-stack.md)).
- Built the Blender kit and the first garage scene. The owner asked for a fuller, warmer room and better characters, then for one even skin tone. Both are done.
- Wrote the `blender-pipeline` project skill.
- Built a first playable loop: weeks, payday, a game project, a release.
