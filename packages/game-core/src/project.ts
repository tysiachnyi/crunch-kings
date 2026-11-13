import {
  BIG_CAMPAIGN,
  BUG_PENALTY_MAX,
  BUG_RATE,
  COMBO_BAD,
  COMBO_GOOD,
  COMBO_GREAT,
  CRUNCH_BUGS,
  CRUNCH_OUTPUT,
  DEV_DIARY_HYPE,
  DEV_DIARY_MOOD,
  ENGINE_AGE_PENALTY,
  GENRE_FATIGUE_PENALTY,
  PRESS_KIT_HYPE,
  QUALITY_BAR_BASE,
  QUALITY_BAR_GROWTH,
  QUALITY_CURVE,
  SIZES,
  SMALL_CAMPAIGN,
  TEST_LAB_BUG_REMOVAL,
  TEST_WEEK_BUG_REMOVAL,
  WORK_RATE,
} from './balance'
import { yearOf } from './calendar'
import { ENGINES, GENRES, OWN_ENGINE_TECH, PLATFORMS, SKILLS, TOPICS } from './content'
import type { Rng } from './rng'
import { effectiveSkill } from './staff'
import type { EngineId, Focus, GameProject, GameSize, GameState, Genre, PlatformId, ProjectPlan, Skill, Topic } from './types'
import { clamp, inflation, log, money } from './util'

export function unlockedGenres(week: number): Genre[] {
  return (Object.keys(GENRES) as Genre[]).filter((g) => GENRES[g].year <= yearOf(week))
}

export function unlockedTopics(week: number): Topic[] {
  return (Object.keys(TOPICS) as Topic[]).filter((t) => TOPICS[t].year <= yearOf(week))
}

export function availablePlatforms(week: number): PlatformId[] {
  return (Object.keys(PLATFORMS) as PlatformId[]).filter((p) => PLATFORMS[p].year <= yearOf(week))
}

export function availableEngines(week: number): Exclude<EngineId, 'own'>[] {
  return (Object.keys(ENGINES) as Exclude<EngineId, 'own'>[]).filter((e) => ENGINES[e].year <= yearOf(week))
}

export function availableSizes(state: GameState): GameSize[] {
  const sizes: GameSize[] = ['S']
  if (state.research.includes('mediumGames')) sizes.push('M')
  if (state.research.includes('largeGames')) sizes.push('L')
  return sizes
}

export function engineTech(state: GameState, engine: EngineId): number {
  if (engine === 'own') return OWN_ENGINE_TECH[state.ownEngine?.level ?? 0] ?? 0
  return ENGINES[engine].tech
}

export function engineYear(state: GameState, engine: EngineId): number {
  if (engine === 'own') return state.ownEngine?.year ?? yearOf(state.week)
  return ENGINES[engine].year
}

export function comboBonus(genre: Genre, topic: Topic): number {
  const shared = GENRES[genre].tags.filter((t) => TOPICS[topic].tags.includes(t)).length
  if (shared >= 2) return COMBO_GREAT
  if (shared === 1) return COMBO_GOOD
  return COMBO_BAD
}

export function comboLabel(genre: Genre, topic: Topic): 'great' | 'good' | 'bad' {
  const bonus = comboBonus(genre, topic)
  return bonus === COMBO_GREAT ? 'great' : bonus === COMBO_GOOD ? 'good' : 'bad'
}

export function focusFit(genre: Genre, focus: Focus): number {
  const ideal = GENRES[genre].ideal
  const diff = SKILLS.reduce((sum, s) => sum + Math.abs(focus[s] - ideal[s]), 0)
  return clamp(1 - diff / 200, 0, 1)
}

export function normalizeFocus(focus: Focus): Focus {
  const total = SKILLS.reduce((sum, s) => sum + Math.max(0, focus[s]), 0)
  if (total <= 0) return { design: 20, tech: 20, art: 20, sound: 15, story: 10, polish: 15 }
  const out = {} as Focus
  for (const s of SKILLS) out[s] = Math.round((Math.max(0, focus[s]) / total) * 100)
  return out
}

function qualityBar(week: number): number {
  return QUALITY_BAR_BASE * (1 + QUALITY_BAR_GROWTH * (yearOf(week) - 1980))
}

function expectedTech(week: number): number {
  return 1 + 0.175 * (yearOf(week) - 1980)
}

function genreFatigue(state: GameState, genre: Genre): boolean {
  const last = state.releases.slice(-2)
  return last.length === 2 && last.every((r) => r.genre === genre)
}

export type QualityBreakdown = {
  quality: number
  fit: number
  combo: number
  engine: number
  bugs: number
  trend: number
  fatigue: number
}

export function projectQuality(state: GameState, project: GameProject, finished = true): QualityBreakdown {
  const total = SKILLS.reduce((sum, s) => sum + project.points[s], 0)
  const weeksDone = Math.max(1, project.totalWeeks - project.weeksLeft)
  const density = total / (finished ? project.totalWeeks : weeksDone)
  const fit = focusFit(project.genre, project.focus)
  const techFactor = clamp(engineTech(state, project.engine) / expectedTech(state.week), 0.6, 1.3)
  const ratio = (density / qualityBar(state.week)) * (0.75 + 0.25 * techFactor)
  const base = 100 * (1 - Math.exp(-QUALITY_CURVE * ratio * fit))
  const combo = comboBonus(project.genre, project.topic)
  const age = yearOf(state.week) - engineYear(state, project.engine)
  const engine = age > 1 ? -ENGINE_AGE_PENALTY * (age - 1) ** 2 : 0
  const bugs = -Math.min(BUG_PENALTY_MAX, (project.bugs / Math.max(1, total)) * 150)
  const trend = state.modifiers
    .filter((m) => m.quality && (m.genre === project.genre || m.topic === project.topic))
    .reduce((sum, m) => sum + (m.quality ?? 0), 0)
  const fatigue = genreFatigue(state, project.genre) ? -GENRE_FATIGUE_PENALTY : 0
  const quality = clamp(base + combo + SIZES[project.size].qualityBonus + engine + bugs + trend + fatigue, 1, 100)
  return { quality, fit, combo, engine, bugs, trend, fatigue }
}

export function startProject(state: GameState, plan: ProjectPlan): GameState {
  if (state.project) throw new Error('A project is already in progress.')
  if (state.activeContract) throw new Error('Finish the contract first.')
  if (!unlockedGenres(state.week).includes(plan.genre)) throw new Error('This genre is not invented yet.')
  if (!unlockedTopics(state.week).includes(plan.topic)) throw new Error('This topic is not available yet.')
  if (!state.platforms.includes(plan.platform)) throw new Error('Buy a license for this platform first.')
  if (!state.engines.includes(plan.engine)) throw new Error('You do not own this engine.')
  if (!availableSizes(state).includes(plan.size)) throw new Error('Research this game size first.')
  if (state.staff.length < SIZES[plan.size].minStaff) throw new Error(`Size ${plan.size} needs ${SIZES[plan.size].minStaff} people.`)
  const weeks = SIZES[plan.size].weeks
  const hype = state.research.includes('pressKit') ? PRESS_KIT_HYPE : 0
  const project: GameProject = {
    ...plan,
    focus: normalizeFocus(plan.focus),
    totalWeeks: weeks,
    weeksLeft: weeks,
    points: { design: 0, tech: 0, art: 0, sound: 0, story: 0, polish: 0 },
    bugs: 0,
    hype,
    testing: false,
    crunch: false,
    startWeek: state.week,
  }
  return log({ ...state, project }, `Work starts on "${plan.title}" (${GENRES[plan.genre].label}, ${TOPICS[plan.topic].label}, size ${plan.size}).`)
}

export function workOnProject(state: GameState, project: GameProject, rng: Rng): GameProject {
  if (project.weeksLeft === 1) {
    const removal = state.research.includes('testLab') ? TEST_LAB_BUG_REMOVAL : TEST_WEEK_BUG_REMOVAL
    return { ...project, bugs: Math.round(project.bugs * (1 - removal)), weeksLeft: 0, testing: true }
  }
  const points = { ...project.points }
  let bugs = project.bugs
  for (const e of state.staff) {
    if (e.burnoutWeeks > 0) continue
    let mult = WORK_RATE * (0.8 + e.morale / 250) * (0.85 + rng.next() * 0.3)
    if (e.traits.includes('perfectionist')) mult *= 0.9
    if (project.crunch) mult *= CRUNCH_OUTPUT * (e.traits.includes('nightOwl') ? 1.1 : 1)
    let output = 0
    for (const s of SKILLS) {
      let gain = (effectiveSkill(e, s) * project.focus[s] * mult) / 100
      if (s === 'sound' && state.research.includes('soundStudio')) gain *= 1.2
      if (s === 'polish' && state.research.includes('playtests')) gain *= 1.1
      points[s] += gain
      output += gain
    }
    let bugRate = BUG_RATE * (1 - project.focus.polish / 200)
    if (project.crunch) bugRate *= CRUNCH_BUGS
    if (e.traits.includes('perfectionist')) bugRate *= 0.7
    bugs += output * bugRate
  }
  return { ...project, points, bugs: Math.round(bugs * 10) / 10, weeksLeft: project.weeksLeft - 1 }
}

export function setCrunch(state: GameState, crunch: boolean): GameState {
  if (!state.project) return state
  const next = { ...state, project: { ...state.project, crunch } }
  return log(next, crunch ? 'Crunch mode on. Pizza boxes pile up.' : 'Crunch mode off. Everyone sees the sun again.', crunch ? 'bad' : 'good')
}

export function runCampaign(state: GameState, kind: 'small' | 'big'): GameState {
  if (!state.project) throw new Error('No game to promote.')
  if (kind === 'big' && !state.research.includes('marketing')) throw new Error('Research marketing first.')
  const campaign = kind === 'big' ? BIG_CAMPAIGN : SMALL_CAMPAIGN
  const cost = Math.round(campaign.cost * inflation(state.week))
  const project = { ...state.project, hype: Math.min(100, state.project.hype + campaign.hype) }
  return log({ ...state, money: state.money - cost, project }, `Ad campaign for "${project.title}": hype +${campaign.hype}. Cost: ${money(cost)}.`)
}

export function writeDevDiary(state: GameState): GameState {
  if (!state.project) throw new Error('No game to write about.')
  const share = 1 / Math.max(1, state.staff.length)
  const points = {} as Record<Skill, number>
  for (const s of SKILLS) points[s] = state.project.points[s] * (1 - share / state.project.totalWeeks)
  const project = { ...state.project, points, hype: Math.min(100, state.project.hype + DEV_DIARY_HYPE) }
  const fandom = { ...state.fandom, mood: clamp(state.fandom.mood + DEV_DIARY_MOOD, 0, 100) }
  return log({ ...state, project, fandom }, `Dev diary #${state.releases.length + 1} goes out. Fans feel heard. Mood +${DEV_DIARY_MOOD}.`, 'fan')
}

export function weakestSkill(project: GameProject): Skill | null {
  const ideal = GENRES[project.genre].ideal
  let worst: Skill | null = null
  let gap = 4
  for (const s of SKILLS) {
    const d = ideal[s] - project.focus[s]
    if (d > gap) {
      gap = d
      worst = s
    }
  }
  return worst
}
