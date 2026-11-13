# Game systems

This page explains each rule system of the demo. Numbers are in `packages/game-core/src/balance.ts`. Content tables are in `content.ts`. Words follow [glossary.md](glossary.md).

## Time

- One tick is one **week**. A year has 52 weeks. Week 1 is January 1980.
- A new **month** starts when the month index changes (`calendar.ts`). Salaries and rent are paid then. New candidates and contracts arrive then.
- The demo ends at the first week of 1990 with the ending `demoComplete`.

## Studio start

- The player picks a studio name, a founder name and an **archetype**: Coder, Designer or Artist.
- The archetype sets the founder's skills and picks the **garage friend**:
  - Coder → Maggie Lee (artist)
  - Artist → Danny Cobb (coder)
  - Designer → Roy Pak (sound)
- Start: $20,000, the garage, the Vector 64 platform, the Tinker Kit engine, fan mood 60.

## Team

- Every employee has six **skills** (design, tech, art, sound, story, polish) and zero to two **traits** (fast learner, workaholic, perfectionist, team player, diva, night owl, cheap, loyal).
- **Morale** (0-100) changes output. **Stress** rises 10 a week in crunch and falls 5 a week otherwise. Stress 80 or more gives **burnout**: 8 weeks with no work.
- A hire with morale below 25 for 4 weeks quits. A loyal employee quits only below 10. The founder never quits.
- **Candidates**: 3 a month, 5 with the recruiter research. Hiring costs one monthly salary. Firing costs two.
- **Training** needs the training room research. It costs $1,500 and gives +1 skill (+1.5 for a fast learner).
- Every release gives +0.3 to the two skills with the most focus. Hires get a raise each January up to a fair salary for their skills.

## Game project

- The player picks title, **genre**, **topic**, **size** (S, M, L), **platform**, **engine** and an optional sequel target. The **focus** comes from the phase decisions (see below).
- A game project has three **phases**, played in order. Each phase has three **aspects**, and each aspect feeds one skill:

  | Phase | Aspect (skill) |
  | --- | --- |
  | 1 Foundation | Code base (tech), Core loop (design), Plot (story) |
  | 2 Content | Levels (design), Artwork (art), Music (sound) |
  | 3 Finish | Bug hunt (polish), Visual effects (art), Audio mix (sound) |

  The table is `PHASES` in `content.ts`.
- The work weeks (project weeks minus the test week) are split over the phases as evenly as possible, earlier phases first: 3-2-2 for size S, 5-4-4 for M, 7-7-7 for L. The test week comes after phase 3.
- A phase waits for the player at the start and each time the weeks of the previous phase are used up. The project has `phase` (0 to 2) and `awaitingPhase`. `isBlocked` is true while `awaitingPhase` is true, so `advanceWeek` does nothing. `setPhaseFocus(state, weights)` stores three weights (0-100, steps of 5 in the UI) and lets the project continue. A weight is relative: the **share** of an aspect is its weight divided by the total of the phase. All zero means equal shares.
- Each week every employee adds work points only to the skills of the running phase, split by the aspect shares, and weighted by morale and traits. The output per week stays on the level of the old six-skill focus. Crunch gives ×1.25 output and ×1.5 bugs.
- The **focus** that the market and the review hints read is computed from the phase weights: each phase counts one third, each aspect share goes to its skill. Phases that are not decided yet count with equal shares. `blendFocus` does this.
- Reachability: tech, design and story from phase 1 add up to at most one third of the focus. `bestPhasePlan(genre)` searches all plans in steps of 5. The best plan reaches a focus fit of 0.98 or more for every genre (Racing 0.98, Adventure 0.98, RPG 0.99, the rest 1.0). To make this true the ideals of Adventure and RPG were lowered in tech and story. `idealPhaseWeights(genre)` gives the shares of the best plan. The UI shows them as a star on the phase sheet after the studio has released a game in that genre. The bot uses them.
- The last week is the **test week**. It removes 50% of bugs (75% with the test lab).
- **Quality** (1-100) comes from:
  - points per week compared with the **quality bar**, which rises 20% of its base every year
  - the **focus fit** with the genre's ideal focus
  - engine tech compared with the expected tech of the year
  - the **combo** of genre and topic: +8 great, +3 good, -8 bad
  - size bonus, hot trends, genre fatigue, engine age and bugs
- Player tools during a game project: crunch on or off, small ads, big ads (after the marketing research), dev diary.

## Release

- **Reviews**: six **outlets** score the game from 1 to 10. Pixel Post is balanced. Joystick Gazette likes tech. Cartridge Weekly likes action. Byte Herald likes brains. Quest Log likes story. Fan Voice follows fan mood. The **score** is their average.
- The **hint** says what held the score back: bugs, an old engine, a bad combo, a weak skill or genre fatigue.
- **Chart rank** compares the score with rival releases within 6 weeks.
- **Sales** are planned at release and paid every week for 32 weeks with a falling curve. Sales depend on platform audience, score, size, fans, fan mood, hype, sequel status and rival releases in the same weeks. Units are capped at 15% of the audience.
- **Unit scale.** `UNIT_SCALE` (20, in `balance.ts`) multiplies every copy count so that daily numbers feel big. `audience()` returns copies, not people: the platform table times 1000 times `UNIT_SCALE`. Player units, the rival estimate, the unit tiers (`UNIT_TIER_UNITS`) and the long seller floor (`LONG_SELLER_UNITS`) all use it. `Release.unitRevenue` is the studio's cut per copy and is divided by `UNIT_SCALE`, so revenue, cash and royalties do not change. Revenue of a release is units times `unitRevenue`.
- **Fans gained** depend on units sold divided by `UNIT_SCALE`, and the score. Fan counts, hype and events stay on the old level.

## Sales desk: days, regions and badges

The week stays the step of the simulation. The code is in `packages/game-core/src/sales.ts`.

- **Real units.** `paySales` stores the units that were really sold each week in `Release.soldWeeks` (the plan in `weeklySales` times the sales modifiers). `totalSales` is their sum.
- **Days.** `dailySales(release, weekIndex)` splits one sold week into 7 **day** values that add up to the week exactly. The weights are a weekday shape (`WEEKDAY_SHAPE`, weekend higher), a slow fall inside the week (`SALES_DAY_DECAY`) and a jitter of 12% from a hash of the release id, the week and the day. It uses no random numbers from the seed. `salesView(release, weekIndex, daysShown)` gives what the sales desk shows: the day number, the units of the last shown day, total, revenue and the last 28 days.
- **Reveal model.** `advanceWeek` finishes a week and knows its units at once. The UI then reveals that finished week day by day during the next timer interval: day 1 at once, days 2 to 7 in six steps of one seventh of the interval. Day 7 shows with a short hold before the next week. At that moment the total on the desk equals `totalSales`. A paused clock stops the reveal.
- **Regions.** `REGIONS` in `content.ts` has six regions with a market share (USA 34%, Japan 20%, Germany 14%, United Kingdom 12%, France 10%, Brazil 10%), a taste weight per genre and a taste weight per topic tag. `regionalSales(release)` splits the units with these weights and a 10% jitter from the release id. The parts add up to the total. The result is the same every time.
- **Rival units.** Rivals have no sales numbers. `rivalPlannedUnits(state, rivalRelease)` estimates them with the formula of the player: reach (the best platform audience of that year, times `RIVAL_REACH_SHARE`) times `SALES_RATE` times `(score / 5)^2` times `RIVAL_SIZE_MULT` times the fan bonus of the rival, with the same cap. `rivalWeeklyUnits` spreads them with the same sales curve (`salesCurve`). It is an estimate. It uses the current fans of the rival.
- **Sales badges.** `awardBadges` runs every week after the rivals. A badge is `{ id, week, label }` in `Release.badges`. A release earns each badge once. Each badge adds a log line (tone good) and `BADGE_HYPE` (1) studio hype.

  | Badge | Rule |
  | --- | --- |
  | New record | The units of this week beat the best week of every earlier game of the studio. Not for the first game. |
  | Cult favorite, Big seller, Smash hit, Legend | Total units reach 800, 2,000, 4,500 or 7,000 times `UNIT_SCALE` times `marketScale(release week)`. `marketScale` is the audience of all platforms in the release year divided by that of 1980 (about 1 in 1980, about 12 in 1989). Only the highest reached tier is awarded. |
  | Bestseller of the week | At least one rival release is on sale, and the units of this week are higher than the estimate of every one of them. |
  | Best seller of the year so far | From week 10 of the year: the units sold this calendar year beat every rival release and every other own game. |
  | Most loved in a region | At least one rival release is on sale, and in that region the game sells at least 1.5 times as much as the best rival. At most one new region badge a week, the one with the biggest margin. |
  | Long seller | After 16 weeks on sale the weekly units are still 40 times `UNIT_SCALE` times `marketScale` or more. |

## Fans

See [angry-fans.md](../design/angry-fans.md) for the full design. The demo slice:

- **Fan mood** 0-100 drifts 1 a week toward 60.
- **Expectation** is the mean of the last 3 scores (5 before the first release). A release moves mood by `(score - expectation) × 6`, limited to -25..+20.
- A score of 8 or more opens a **sequel demand**. A sequel to that game fulfils it (+12 mood).
- A demand older than 26 weeks costs mood every week and becomes a **petition** event once.
- Mood below 25 at a release gives a **review bomb**: Fan Voice -2 and sales -10% for 4 weeks.
- A mood drop of 10 or more sends an **angry letter**. A hit while mood is below 40 gives **forgiveness** (+20).
- A dev diary gives +6 mood and +3 hype.

## Money and business

- Monthly costs: all salaries plus the office rent. Inflation is 3% a year.
- **Contracts** open after the first release. 3 offers a month. The team works on one contract when no game project runs. Finishing pays. Missing the deadline costs a penalty.
- **Research points** come from releases and from idle weeks. A **research node** costs research points and money (13 nodes, some need a parent node).
- **Licenses**: platforms (Kestrel PC $3,000 from 1983, Funbox $15,000 from 1985) and engines (Pixel Pal from 1984, Scroll Master from 1988 with 3% royalty). The **own engine** comes from research.
- **Office**: the garage (2 seats, $200 rent) and the small office (6 seats, $1,500 rent, $6,000 to move). The move opens after the first profitable year.
- **Rescue ladder**: 4 weeks with negative money → Mr Hawk offers a rescue loan. 8 more weeks → a publisher takes over (-40% of hires, money set to $5,000). 8 more weeks → the ending `bankrupt`.

## Rivals and competitions

- 5 bible rivals in the demo: Brickyard Games, Moonlit Bytes, Old Oak Interactive, Hexagon Hounds (from 1982), Neon Pigeon (from 1986).
- Each rival releases games on its own pace. Its quality grows 0.1 a year.
- A rival with an average score below 5 for 3 years closes. A new generated rival opens every 3 years.
- **Golden Cartridge Awards**: nominations in week 48, the show in week 50. Categories: Game of the Year, Best Action Game, Best Brain Game. A win gives hype, fans and morale.
- **Game jam**: every spring from 1981. Entering slips the game project 1 week and can win fans and hype.

## Events

- About 4 random events a year, each with a cooldown: pirate copies, power outage, magazine story, expo, poaching, hot trend, TV spot, bad word of mouth, flood, school visit, lucky intern, coffee machine, engine bug.
- Scheduled story beats: studio birthday every January, a friend scene in week 10, the market crash in 1983, chapter 2 in January 1985, game jams, the Giga Gorilla news in late 1989.
- Story beats on release: the first game, the first hit, the mom call after a score below 4.
- An event with choices becomes a **pending event**. The time stops until the player chooses.

## Milestones

First game, first profitable year, first score of 7+, six employees, first platform license, own engine.
