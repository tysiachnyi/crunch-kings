import {
  FAN_ANGRY_DROP,
  FAN_DEMAND_PATIENCE,
  FAN_EXPECTATION_DEFAULT,
  FAN_FORGIVE,
  FAN_FORGIVE_BELOW,
  FAN_MOOD_REST,
  FAN_RELEASE_FACTOR,
  FAN_RELEASE_MAX,
  FAN_RELEASE_MIN,
  FAN_REVIEW_BOMB_MOOD,
  FAN_REVIEW_BOMB_WEEKS,
  FAN_SEQUEL_FULFIL,
  HIT_SCORE,
} from './balance'
import { ANGRY_LETTERS, FAN_LETTERS, PETITIONS } from './content'
import type { Rng } from './rng'
import { shiftMorale } from './staff'
import type { GameState, PendingEvent, Release } from './types'
import { clamp, fill, log } from './util'

export function expectationBefore(releases: Release[]): number {
  const last = releases.slice(-3)
  if (last.length === 0) return FAN_EXPECTATION_DEFAULT
  return last.reduce((sum, r) => sum + r.score, 0) / last.length
}

export function moodFace(mood: number): string {
  if (mood >= 80) return '😍'
  if (mood >= 60) return '🙂'
  if (mood >= 40) return '😐'
  if (mood >= 25) return '😠'
  return '🤬'
}

function withMood(state: GameState, delta: number): GameState {
  return { ...state, fandom: { ...state.fandom, mood: clamp(state.fandom.mood + delta, 0, 100) } }
}

function queue(state: GameState, event: PendingEvent): GameState {
  return { ...state, pendingEvents: [...state.pendingEvents, event] }
}

export function fansReactToRelease(state: GameState, release: Release, rng: Rng): GameState {
  const before = state.fandom.mood
  const expectation = expectationBefore(state.releases.slice(0, -1))
  const delta = clamp(Math.round((release.score - expectation) * FAN_RELEASE_FACTOR), FAN_RELEASE_MIN, FAN_RELEASE_MAX)
  let next = withMood(state, delta)
  if (delta !== 0) {
    next = log(next, delta > 0 ? `Fans are thrilled. Mood +${delta}.` : `Fans expected ${expectation.toFixed(1)} and got ${release.score}. Mood ${delta}.`, 'fan')
  }
  if (before < FAN_REVIEW_BOMB_MOOD) {
    next = { ...next, fandom: { ...next.fandom, reviewBombWeeks: FAN_REVIEW_BOMB_WEEKS } }
    next = log(next, `Review bomb! Angry fans flood Fan Voice with one-star letters. Sales -10% for ${FAN_REVIEW_BOMB_WEEKS} weeks.`, 'bad')
  }
  if (release.score >= HIT_SCORE && before < FAN_FORGIVE_BELOW) {
    next = withMood(next, FAN_FORGIVE)
    next = log(next, `"WE NEVER DOUBTED YOU." The fans forgive everything. Mood +${FAN_FORGIVE}.`, 'fan')
  }
  if (release.sequelOf) {
    const demand = next.fandom.demands.find((d) => d.kind === 'sequel' && d.target === release.sequelOf)
    if (demand) {
      next = withMood(next, FAN_SEQUEL_FULFIL)
      next = { ...next, fandom: { ...next.fandom, demands: next.fandom.demands.filter((d) => d.id !== demand.id) } }
      next = log(next, `The sequel is here! Fans got what they asked for. Mood +${FAN_SEQUEL_FULFIL}.`, 'fan')
    }
  }
  if (release.score >= HIT_SCORE) {
    const demand = { id: `dem-${next.nextId}`, kind: 'sequel' as const, text: `A sequel to "${release.title}"`, target: release.id, openedWeek: next.week, petitioned: false }
    next = { ...next, nextId: next.nextId + 1, fandom: { ...next.fandom, demands: [...next.fandom.demands, demand] } }
    next = log(next, `Fans demand a sequel to "${release.title}". They will not forget.`, 'fan')
  }
  if (before - next.fandom.mood >= FAN_ANGRY_DROP) {
    next = queue(next, {
      id: 'angryLetter',
      title: 'A letter in caps lock',
      text: fill(rng.pick(ANGRY_LETTERS), { studio: next.studioName.toUpperCase() }),
      choices: [{ id: 'ok', label: 'Pin it to the wall' }],
    })
  }
  return next
}

export function weeklyFans(state: GameState, rng: Rng): GameState {
  let next = state
  const mood = state.fandom.mood
  const drift = mood < FAN_MOOD_REST ? 1 : mood > FAN_MOOD_REST ? -1 : 0
  next = withMood(next, drift)
  const overdue = next.fandom.demands.filter((d) => next.week - d.openedWeek > FAN_DEMAND_PATIENCE)
  if (overdue.length > 0) next = withMood(next, -Math.min(2, overdue.length))
  const fresh = overdue.find((d) => !d.petitioned)
  if (fresh) {
    const ask = rng.pick(PETITIONS)
    const signatures = Math.max(120, Math.round(next.fans * (0.2 + rng.next() * 0.3)))
    next = {
      ...next,
      fandom: { ...next.fandom, demands: next.fandom.demands.map((d) => (d.id === fresh.id ? { ...d, petitioned: true } : d)) },
    }
    next = queue(next, {
      id: 'petition',
      title: 'A petition arrives',
      text: `${signatures.toLocaleString('en-US')} fans sign a petition: "${ask}". They also still want ${fresh.text.toLowerCase()}.`,
      choices: [
        { id: 'fulfil', label: `Add it in a free update ($1,500)` },
        { id: 'ignore', label: 'Ignore it' },
      ],
      data: { demand: fresh.id, ask },
    })
  }
  if (next.fandom.reviewBombWeeks > 0) next = { ...next, fandom: { ...next.fandom, reviewBombWeeks: next.fandom.reviewBombWeeks - 1 } }
  if (next.fandom.mood > 80 && rng.chance(0.03)) {
    next = log(shiftMorale(next, 3), 'A fan mails a drawing of the team as superheroes. Morale +3.', 'fan')
  } else if (next.fans > 100 && rng.chance(0.015)) {
    next = log(shiftMorale(next, 5), fill(rng.pick(FAN_LETTERS), { studio: next.studioName }), 'fan')
  }
  return next
}
