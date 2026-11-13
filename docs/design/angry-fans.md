# Angry fans

Status: demo slice built in `packages/game-core/src/fans.ts`. All numbers are starting values for balance. Playtests must confirm them.

## Idea

Fans are a crowd with a mood and a memory. They love you, they demand things, they get angry in caps lock, and they forgive you when you listen. The joke is about fan culture habits, never about one person. Fans are loud and funny, never cruel.

## State

| Field | Range | Meaning |
| --- | --- | --- |
| `fans` | 0 and up | How many people follow the studio. Drives launch sales. |
| `mood` | 0-100, start 60 | How the fans feel now. |
| `expectation` | 1-10 | The score that fans expect from the next game: the mean of the last 3 release scores, or 5 before the first release. |
| `demands` | list | Open requests, for example "a sequel to Zombie Tax Office". Each has an age in weeks. |

## How mood changes

- At release: mood changes by `(score - expectation) × 6`, limited to -25..+20. A good game after great games still disappoints.
- A demand that the player fulfils (a sequel to the requested game): mood +12.
- Each week that a demand stays open after 26 weeks: mood -1.
- A delay after the player announced a release week: mood -8.
- Mood drifts 1 point a week toward 60.

## How mood acts back

- Launch sales × `0.7 + mood / 200` (0.7 at mood 0, 1.2 at mood 100).
- The Fan Voice review moves ±1.5 with mood.
- Mood above 80: fans make fan art and cosplay, and hype goes up for free.

## Fan reactions (events)

| Reaction | Trigger | What happens |
| --- | --- | --- |
| Sequel demand | A release scores 8 or more | A demand opens for its sequel. |
| Angry letter | Mood falls by 10 or more in one week | A funny letter in caps lock. No effect, pure flavor. |
| Petition | A demand is older than 26 weeks | "12,000 fans sign: ADD A HORSE". Fulfil it (mood +10) or ignore it (mood -5). |
| Review bomb | Mood below 25 at a release | Fan Voice score -2 and sales -10% for 4 weeks. |
| Conspiracy theory | A delay | Fans "prove" that the game was cancelled. Hype +5, mood -3. |
| Fan art | Mood above 80, at random | Morale +3 for the team. |
| Forgiveness arc | A score of 8 or more while mood is below 40 | Mood +20. "WE NEVER DOUBTED YOU." |

## Player tools

- **Dev diary:** one week of work from one person. Mood +6, hype +3.
- **Apology post:** free. Mood +5 and hype -5. It gives no effect again within 12 weeks.
- **Patch:** two weeks of work after a release. It removes bugs and gives mood +4.
- **Community manager** (hire, after 1985): halves the open-demand mood loss.

## Demo slice (1980-1989)

Build these first: `mood`, `expectation`, sequel demand, angry letter, petition, review bomb and the dev diary. The other parts come with later eras.

## UI

- A fan mood meter in the HUD, shown as a face that changes with the mood.
- Fan letters arrive in a mail pile on the office desk (a 3D prop). A click on the pile opens the newest letter.
- A petition shows as a growing scroll with a counter of signatures.
