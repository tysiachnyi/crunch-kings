# UI

All UI is in `apps/web/src`. The UI text is in English.

## Screens

| Screen | File | Content |
| --- | --- | --- |
| Title menu | `App.tsx` (`TitleMenu`) | Continue, New studio, How to play, sound on or off. |
| Studio setup | `NewStudio.tsx` | Studio name, founder name, archetype, the matching garage friend. |
| Play | `App.tsx` | 3D office, HUD, side panel, short log, tips, toasts. |
| Release day | `ui/Modals.tsx` (`ReleaseDay`) | Six reviews open one by one like envelopes, then the score, the hint, chart rank, fans gained and the sales curve. |
| Event | `ui/Modals.tsx` (`EventModal`) | Title, text and one button per choice. |
| Ending | `ui/Modals.tsx` (`EndingScreen`) | Run statistics, best game, the friend line and the Giga Gorilla teaser. |

## HUD

Studio name, date, money, fan mood face and fan count, studio hype, research points, play or pause, speed 1x/2x/4x, Menu.

## Side panel tabs

| Tab | Content |
| --- | --- |
| Project | The new game form (with focus sliders), or the running game project, or the running contract. |
| Team | Employees with skills, traits, morale, stress, train and fire. Candidates with Hire. |
| Research | All research nodes. |
| Business | Weekly sales, monthly costs, loan, contracts, office move, licenses, engines, milestones. |
| Fans | Mood, expectation, review bomb, open demands. |
| Rivals | Active rivals, recent rival releases, awards. |
| Games | Your releases. A click opens the release day screen again. |
| Log | The last 60 log entries with dates. |

On a narrow screen the side panel moves to the bottom and the short log hides.

## Keys

- Space: play or pause.
- 1, 2, 3: speed 1x, 2x, 4x.
- Esc: close the release day screen or clear the selection.

## Tips

`ui/Tutorial.tsx` shows one tip card at a time when its condition is true. "Skip tips" hides all of them. The menu can show them again. The state is in `localStorage` under `crunch-kings/tutorial-v1`.

## Sound

`sound.ts` makes UI sounds with WebAudio oscillators: click, coin, payday, fanfare, review, ding, bad, hire, research. There are no audio files and no music. The mute choice is in `localStorage` under `crunch-kings/muted`.
