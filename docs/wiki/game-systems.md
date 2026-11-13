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

- The player picks title, **genre**, **topic**, **size** (S, M, L), **platform**, **engine**, an optional sequel target, and the **focus** (six sliders that add up to 100).
- Each week every employee adds work points to the six skills, weighted by the focus, morale and traits. Crunch gives ×1.25 output and ×1.5 bugs.
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
- **Fans gained** depend on units sold and the score.

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
