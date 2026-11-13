# Status

Last update: 2026-11-13.

## Works and is tested

- The whole 1980-1989 demo can be played from the title menu to the ending.
- `pnpm test`: 98 tests pass. `pnpm typecheck`: all 4 projects pass. `pnpm build` passes.
- The print look for the UI. Checked in the browser at desktop width: title menu, studio setup, Project, Team and Business tabs, release day, closed panel.
- Checked in the browser: a new game project with the three phase sheets, the phase bar, and release day.
- Checked in the browser: the sales desk (day steps, count-up, totals match the core at the end of each week, stamp animation, other games, release day and Games tab with badges and regions) at 1440x900, 1100x700 and 420x820.
- Checked in the browser: setup, first game project, release day, contracts, the small office with 6 people, a burned-out employee, a petition event, the demo ending.

## Not verified

- **Balance.** It is tuned only with the bot in `testkit.ts`. A smart bot ends the demo with about $5.5M (three seeds: $5.1M-$5.9M, badge hype included). A bot that never upgrades ends with $18k-$71k. A first game usually scores 4-5. Real playtests must confirm this.
- **Animation.** It was seen only on still screenshots. The stamp sound and the bar animation were not heard or watched live.
- **Sales numbers.** All copy counts are 20 times bigger (`UNIT_SCALE`). A first game sells about 1,500 a week at first, hundreds a day. The studio's cut per copy is 20 times smaller, so money is the same. The badge thresholds and the rival estimate are tuned only with the bot.
- **Print look.** Not seen with the new look: Research, Fans, Rivals, Games and Log tabs, the event sheet, the ending, the in-game layout on a narrow screen.

## Known gaps

- Old saves (`save-v5` and older) are ignored.
- The JS bundle is larger than 500 KB. Vite warns about it.
- The garage stage has no garage door. It keeps the look the owner approved.
- No music. No difficulty choice.
- Not in the demo: XL games, teams, publishing deals, engine sales, the apology post, patches, the community manager, the full 30 bible events, 28 topics, 15 genres, the later offices and eras, achievements, the 7 endings.

## Open questions for the owner

- Bible question 9: chiptune or live music.
- Should the garage stage get a garage door?
- Should the demo get the bible difficulty table later?

## Next steps (proposals)

1. Playtest the demo with friends and tune `balance.ts`.
2. Deploy the demo to a static host (itch.io is the bible plan).
3. Split the JS bundle (load three.js and the scene on demand).
4. Era looks for the office (props and materials per decade).
5. Chapter 3 (1990-1996): Giga Gorilla, fighting and strategy genres, the studio floor.
