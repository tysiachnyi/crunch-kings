import { buyEngine, buyPlatform, buyResearch, canMove, moveOffice, researchAvailable } from './business'
import { ENGINES, GENRES, PLATFORMS, RESEARCH } from './content'
import { advanceWeek, resolveEvent } from './game'
import { audience } from './market'
import { yearOf } from './calendar'
import { availableEngines, availablePlatforms, availableSizes, comboBonus, engineTech, engineYear, startProject, unlockedGenres, unlockedTopics } from './project'
import { capacity, hire, monthlyCosts } from './staff'
import { SIZES } from './balance'
import type { EngineId, GameSize, GameState, Genre, PlatformId, ProjectPlan, ResearchId, Topic } from './types'

export function plan(overrides: Partial<ProjectPlan> = {}): ProjectPlan {
  const genre = overrides.genre ?? 'arcade'
  return {
    title: 'Test Game',
    genre,
    topic: 'space',
    size: 'S',
    platform: 'vector64',
    engine: 'tinker',
    focus: { ...GENRES[genre].ideal },
    ...overrides,
  }
}

export function runWeeks(state: GameState, weeks: number, autoChoice = true): GameState {
  let s = state
  for (let i = 0; i < weeks; i++) {
    while (autoChoice && s.pendingEvents.length > 0) {
      const event = s.pendingEvents[0]!
      s = resolveEvent(s, event.choices[event.choices.length - 1]!.id)
    }
    s = advanceWeek(s)
  }
  return s
}

function engineScore(state: GameState, engine: EngineId): number {
  const age = yearOf(state.week) - engineYear(state, engine)
  return engineTech(state, engine) * 10 - 1.1 * Math.max(0, age - 1) ** 2
}

export function bestPlan(state: GameState, title: string): ProjectPlan {
  const lastGenres = state.releases.slice(-2).map((r) => r.genre)
  let best: { genre: Genre; topic: Topic; bonus: number } = { genre: 'arcade', topic: 'space', bonus: -99 }
  for (const genre of unlockedGenres(state.week)) {
    if (lastGenres.length === 2 && lastGenres.every((g) => g === genre)) continue
    for (const topic of unlockedTopics(state.week)) {
      const bonus = comboBonus(genre, topic)
      if (bonus > best.bonus) best = { genre, topic, bonus }
    }
  }
  const platform = [...state.platforms].sort((a, b) => audience(b, state.week) - audience(a, state.week))[0] as PlatformId
  const engine = [...state.engines].sort((a, b) => engineScore(state, b) - engineScore(state, a))[0] as EngineId
  const sizes = availableSizes(state).filter((size) => state.staff.length >= SIZES[size].minStaff)
  const size = sizes[sizes.length - 1] as GameSize
  return plan({ title, genre: best.genre, topic: best.topic, platform, engine, size })
}

const RESEARCH_ORDER: ResearchId[] = ['mediumGames', 'engineBasics', 'marketing', 'testLab', 'largeGames', 'engineTools', 'pressKit', 'soundStudio', 'teamSpirit']

function manage(state: GameState, smart: boolean): GameState {
  let s = state
  if (!smart) return s
  const reserve = monthlyCosts(s) * 4
  for (const id of RESEARCH_ORDER) {
    if (researchAvailable(s, id) && s.researchPoints >= RESEARCH[id].rp && s.money - RESEARCH[id].cost > reserve) s = buyResearch(s, id)
  }
  for (const id of availablePlatforms(s.week)) {
    if (!s.platforms.includes(id) && s.money > PLATFORMS[id].license * 2 + reserve) s = buyPlatform(s, id)
  }
  for (const id of availableEngines(s.week)) {
    if (!s.engines.includes(id) && ENGINES[id].tech > Math.max(...s.engines.map((e) => engineScore(s, e) / 10)) && s.money > ENGINES[id].fee * 2 + reserve) s = buyEngine(s, id)
  }
  if (canMove(s, 'smallOffice') && s.money > 20000) s = moveOffice(s, 'smallOffice')
  const best = [...s.candidates].sort((a, b) => b.salary - a.salary)[0]
  if (best && s.staff.length < capacity(s) && s.money > reserve * 2 + best.salary * 6) s = hire(s, best.id)
  return s
}

export function autoplay(state: GameState, weeks: number, smart = true): GameState {
  let s = state
  for (let i = 0; i < weeks && !s.ending; i++) {
    while (s.pendingEvents.length > 0) {
      const event = s.pendingEvents[0]!
      s = resolveEvent(s, event.choices[0]!.id)
    }
    s = manage(s, smart)
    if (!s.project && !s.activeContract) s = startProject(s, bestPlan(s, `Game ${s.releases.length + 1}`))
    s = advanceWeek(s)
  }
  return s
}
