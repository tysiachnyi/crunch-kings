import { useState } from 'react'
import type { GameState } from '@crunch-kings/game-core'

const KEY = 'crunch-kings/tutorial-v1'

type Step = { id: string; text: string; when: (g: GameState) => boolean }

const STEPS: Step[] = [
  { id: 'welcome', text: 'Welcome to the garage! Open the Project tab and start your first game. Pick a genre and a topic that fit together.', when: (g) => g.releases.length === 0 && !g.project },
  { id: 'focus', text: 'A game has three phases: Foundation, Content and Finish. Before each phase you set how the team splits its work. Each genre has an ideal split. The reviews will hint what was missing.', when: (g) => g.releases.length === 0 && !g.project },
  { id: 'play', text: 'Set the sliders for the phase, then press Play (or Space) to let the weeks run. The game stops when the next phase is due. Salaries and rent come every month.', when: (g) => !!g.project && g.releases.length === 0 },
  { id: 'crunch', text: 'Crunch makes the team faster, but adds bugs and stress. People burn out above 80 stress.', when: (g) => !!g.project && g.project.weeksLeft < g.project.totalWeeks - 2 && g.releases.length === 0 },
  { id: 'after', text: 'First game out! Now: take contracts in Business for quick cash, and spend research points in Research.', when: (g) => g.releases.length >= 1 },
  { id: 'fans', text: 'Fans remember. Score below what they expect and they get angry. Hits make them demand sequels. Watch the face in the top bar.', when: (g) => g.releases.length >= 1 },
  { id: 'grow', text: 'After your first profitable year you can move to a small office and hire. Bigger teams make better games.', when: (g) => g.releases.length >= 2 },
]

function readDone(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

export function Tutorial({ game }: { game: GameState }) {
  const [done, setDone] = useState<string[]>(readDone)
  const step = STEPS.find((s) => !done.includes(s.id) && s.when(game))
  if (!step) return null
  const close = (all: boolean) => {
    const next = all ? STEPS.map((s) => s.id) : [...done, step.id]
    setDone(next)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      return
    }
  }
  return (
    <div className="tutorial">
      <p className="kicker">Tip</p>
      <p>{step.text}</p>
      <div className="row">
        <button className="secondary" onClick={() => close(false)}>
          Got it
        </button>
        <button className="link" onClick={() => close(true)}>
          Skip tips
        </button>
      </div>
    </div>
  )
}

export function resetTutorial() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    return
  }
}
