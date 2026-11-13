# UI

All UI is in `apps/web/src`. The UI text is in English.

## Look

The print look: the UI is paper on a dark desk, in the style of a 1980s computer magazine. The colors match the garage stage.

- Tokens are CSS variables at the top of `styles.css`. Paper `--paper`, ink `--ink`, accent `--accent` (terracotta), desk `--desk`. Use the accent only for the main action, scores and progress.
- Fonts: Caprasimo for the logo, titles and scores. IBM Plex Sans for text. IBM Plex Mono for labels and numbers.
- Labels are small uppercase mono. Sections are split with ink rules, not with boxes inside boxes.
- No emoji. Icons are SVG in `ui/Icons.tsx`.
- Corners are 2-3 px. Buttons have an ink border and no shadow. A disabled button has a dashed border.

## Layout

- Title menu and studio setup: a paper cover on the left, the office on the right.
- Play: the top bar, the office, the ticker (the last three log entries) at the bottom left, the sheet and the tab rail on the right edge. A click on the active tab closes the sheet.
- The left stack under the top bar (`.left-stack`, 300 px wide) holds the sales desk and, below it, the tip as a yellow sticky note. The selected-object label sits at 344 px from the left, the ticker at the bottom left. The desk shows only while an own game is on sale.
- Sales desk (`ui/SalesDesk.tsx`): kicker "Sales desk" and "Day N on sale", the title of the newest game on sale (a click opens its release day), the units of the shown day as a big terracotta number that counts up (with the change against the day before when it is 10 or more), a bar chart of the last 28 days (the newest bar in the accent colour, a new bar each day), total copies and revenue, the earned sales badges as ink stamps, and up to three rows "Also selling". A new badge stamps in (`stamp` keyframes, terracotta while fresh) with the `stamp` sound. Badges of the current week appear from day 2 on, one per day. Under a height of 760 px the desk shows two rows of other games. Under a width of 760 px it shrinks to one line: title, today, total.
- The same stamps and a regional breakdown (`RegionBars`, one bar per region) show in the release day sheet of an old game and in the Games tab rows.
- Events, release day and the ending are paper sheets over the office.

## Screens

| Screen | File | Content |
| --- | --- | --- |
| Title menu | `App.tsx` (`TitleMenu`) | Continue, New studio, How to play, sound on or off. |
| Studio setup | `NewStudio.tsx` | Studio name, founder name, archetype, the matching garage friend. |
| Play | `App.tsx` | 3D office, HUD, side panel, short log, tips, toasts. |
| Release day | `ui/Modals.tsx` (`ReleaseDay`) | Six reviews open one by one like envelopes, then the score, the hint, chart rank, fans gained and the sales curve. For an old game it adds sold copies, the sales badges and the regional bars. |
| Event | `ui/Modals.tsx` (`EventModal`) | Title, text and one button per choice. |
| Phase sheet | `ui/Modals.tsx` (`PhaseSheet`) | Kicker "Phase 2 of 3", the phase name, game title and genre line, a report of the phase that ended (points per skill, bugs), three aspect sliders (0-100, step 5) with the share in percent and, if the studio released this genre before, a star with the ideal share. One button: Start phase, or Start the last phase. The clock pauses when it opens. Space does not start the clock while it is open. An event sheet shows first if both wait. After the player confirms, the clock starts again by itself if it ran before the sheet opened. |
| Ending | `ui/Modals.tsx` (`EndingScreen`) | Run statistics, best game, the friend line and the Giga Gorilla teaser. |

## HUD

Studio name, date, then labelled readouts: Cash, Fans (with the mood face), Hype, Research. Then Play or Pause, speed 1x/2x/4x, Menu.

## Side panel tabs

| Tab | Content |
| --- | --- |
| Project | The new game form (title, genre, topic, size, platform, engine, sequel), or the running game project (current phase, three-segment phase bar, aspect shares, skill points, bugs, hype), or the running contract. |
| Team | Employees with skills, traits, morale, stress, train and fire. Candidates with Hire. |
| Research | All research nodes. |
| Business | Weekly sales, monthly costs, loan, contracts, office move, licenses, engines, milestones. |
| Fans | Mood, expectation, review bomb, open demands. |
| Rivals | Active rivals, recent rival releases, awards. |
| Games | Your releases with their sales badges and a regional breakdown. A click on the row opens the release day screen again. |
| Log | The last 60 log entries with dates. |

On a narrow screen the sheet moves to the bottom, the tab rail becomes a horizontal strip and the ticker hides.

## Sales clock

`useGame` keeps a day counter (`salesDays`, 1 to 7) for the week that just finished. A timer of `WEEK_MS / speed / 7` raises it while the clock runs. It resets to 1 when the week changes. A paused clock, an open sheet or a new load (7 days) stop or skip it. Counters on the desk tween in less than one day step, so the shown total never lags behind a whole week.

## Keys

- Space: play or pause.
- 1, 2, 3: speed 1x, 2x, 4x.
- Esc: close the release day screen or clear the selection.

## Tips

`ui/Tutorial.tsx` shows one tip card at a time when its condition is true. "Skip tips" hides all of them. The menu can show them again. The state is in `localStorage` under `crunch-kings/tutorial-v1`.

## Sound

`sound.ts` makes UI sounds with WebAudio oscillators: click, coin, payday, fanfare, review, ding, bad, hire, research, stamp. There are no audio files and no music. The mute choice is in `localStorage` under `crunch-kings/muted`.
