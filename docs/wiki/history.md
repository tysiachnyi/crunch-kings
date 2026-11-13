# History

Newest first. Add a line here when you finish a piece of work.

## 2026-11-13: unit scale

Branch `claude/ui-design-app-b7a520`. Not committed.

- The sales desk showed 1-4 copies a day. The owner wants dozens to hundreds early and thousands later.
- New `UNIT_SCALE = 20` in `balance.ts`. `audience()` is 20 times bigger, so player units, planned sales, rival estimates and regional units are 20 times bigger. `UNIT_TIER_UNITS` and `LONG_SELLER_UNITS` are 20 times bigger. `unitRevenue` is divided by 20, so money does not change. Fans gained use units divided by 20.
- Save version is 6 (`save-v6`). Old saves hold old units.
- Bots (seeds 7, 11, 23): money, fans, average score and badges match the old run within 3%. The small difference is rounding: weekly units of the tail were rounded to whole copies before. Units are about 20 times bigger.
- Test: a release has revenue equal to units times `unitRevenue`, and a first 1980 game with a score of 3 to 5 sells 2,000 to 10,000 copies.

## 2026-11-13: sales desk

Branch `claude/ui-design-app-b7a520`. Not committed.

- The owner wants the time after a release to be exciting: watch the sales grow day by day, with labels that arrive over time.
- `game-core` keeps the week as the step. New file `sales.ts`: `dailySales`, `salesView`, `regionalSales`, `rivalPlannedUnits`, `rivalWeeklyUnits`, `awardBadges`, `unitTiers`, `marketScale`, `isOnSale`. `Release` has `soldWeeks` (real units per week) and `badges`. `REGIONS` and `UNIT_TIERS` are in `content.ts`, the numbers in `balance.ts`. Save version is 5 (`save-v5`).
- Badges: New record, Cult favorite, Big seller, Smash hit, Legend, Bestseller of the week, Best seller of the year so far, Most loved in a region, Long seller. Each gives a log line and 1 hype.
- Bots: smart bot ends with $5.13M, $5.93M and $5.80M for seeds 7, 11, 23 (before $4.92M, $5.65M, $5.45M). Bot without upgrades is unchanged: $18k, $41k, $71k. The extra hype from badges adds about 4-6%.
- UI: the sales desk at the top left, stamps, regional bars in release day and the Games tab, a `stamp` sound. The tip note moved under the desk. Fix: after a phase sheet the clock starts again by itself if it ran before.
- Checked in the browser at 1440x900, 1100x700 and 420x820 with a bot save and a real first game: day steps, count-up, totals, a stamp, no overlap, no new console errors.

## 2026-11-13: development phases

Branch `claude/ui-design-app-b7a520`. Not committed.

- The owner said development flies by after "Start development". A game project now has three phases: Foundation, Content, Finish. Each has three aspects and each aspect feeds one skill (`PHASES` in `content.ts`).
- Before each phase the project waits and the player sets three aspect weights on a phase sheet. The New game form lost its six focus sliders.
- `game-core`: `GameProject` has `phase`, `awaitingPhase`, `phaseWeeksLeft`, `phaseWeights` and `phaseStart`. `ProjectPlan` has no focus. New functions `setPhaseFocus`, `blendFocus`, `phaseShares`, `phaseLengths`, `phasePoints`, `bestPhasePlan`, `idealPhaseWeights`. `isBlocked` is true while a phase waits. The effective `project.focus` is computed from the phase weights.
- Adventure and RPG ideals changed (tech and story lower, design, art and sound higher) because tech plus story from phase 1 can reach only one third of the focus. Every genre now reaches a focus fit of 0.98 or more (`phases.test.ts`).
- The bot answers phase decisions with the ideal shares. Smart bot ends with $4.9M-$5.6M (before $5.5M-$5.9M). Bot without upgrades ends with $18k-$71k (before $2k-$35k). Save version is 4.
- UI: `PhaseSheet`, phase bar in the project panel, the clock pauses when a phase is due, Space is ignored while the sheet is open, tip texts updated.


## 2026-11-13: the print look for the UI

Branch `claude/ui-design-app-b7a520`. Not committed.

- The owner rejected the first UI look (purple cards, coral buttons, emoji icons) as generic.
- Replaced it with the print look: cream paper, dark ink, one terracotta accent, on a dark blue desk. See [ui.md](ui.md).
- New layout: a flat top bar with labelled readouts, a paper sheet with a vertical tab rail on the right edge, a ticker for the short log, a sticky note for tips, a left cover for the title menu and the studio setup.
- Fonts come from `@fontsource`: Caprasimo, IBM Plex Sans, IBM Plex Mono. No emoji. `ui/Icons.tsx` draws the fan mood face, play and pause as SVG.
- Release day shows reviews as press clippings and the score as a stamp. Scores use one format (`score()` in `format.ts`).
- The Fire action asks in the panel. The browser `confirm()` dialog is gone.
- `BACKDROP_COLOR` in `packages/scene` changed to `#141925` to match the desk.

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
