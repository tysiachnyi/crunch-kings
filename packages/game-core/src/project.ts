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
  PHASE_WEIGHT_MAX,
  PHASE_WEIGHT_STEP,
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
import { ENGINES, GENRES, OWN_ENGINE_TECH, PHASES, PLATFORMS, SKILLS, TOPICS } from './content'
import type { Rng } from './rng'
import { effectiveSkill } from './staff'
import type { EngineId, Focus, GameProject, GameSize, GameState, Genre, PhaseWeights, PlatformId, ProjectPlan, Skill, Topic } from './types'
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

const EQUAL_WEIGHTS: PhaseWeights = [1, 1, 1]

function emptyFocus(): Focus {
  return { design: 0, tech: 0, art: 0, sound: 0, story: 0, polish: 0 }
}

export function phaseLengths(totalWeeks: number): number[] {
  const work = totalWeeks - 1
  const base = Math.floor(work / PHASES.length)
  const extra = work - base * PHASES.length
  return PHASES.map((_, i) => base + (i < extra ? 1 : 0))
}

export function phaseShares(weights: PhaseWeights): PhaseWeights {
  const total = weights.reduce((sum, w) => sum + Math.max(0, w), 0)
  if (total <= 0) return [1 / 3, 1 / 3, 1 / 3]
  return weights.map((w) => Math.max(0, w) / total) as PhaseWeights
}

export function blendFocus(weights: PhaseWeights[]): Focus {
  const out = emptyFocus()
  PHASES.forEach((phase, p) => {
    const shares = phaseShares(weights[p] ?? EQUAL_WEIGHTS)
    phase.aspects.forEach((aspect, i) => {
      out[aspect.skill] += (100 * shares[i]!) / PHASES.length
    })
  })
  return out
}

export function phasePoints(project: GameProject): Focus {
  const out = emptyFocus()
  for (const s of SKILLS) out[s] = Math.max(0, project.points[s] - project.phaseStart[s])
  return out
}

function planTriples(step: number): PhaseWeights[] {
  const out: PhaseWeights[] = []
  for (let a = 0; a <= 100; a += step) for (let b = 0; a + b <= 100; b += step) if ((100 - a - b) % step === 0) out.push([a, b, 100 - a - b])
  return out
}

/**
 * Finds the phase plan whose blended focus is closest to the ideal focus of a genre.
 * It tries every plan where each phase has weights in the given step that add up to 100.
 * A tiny penalty for uneven weights decides ties, so the result is stable and easy to read.
 */
export function bestPhasePlan(genre: Genre, step = PHASE_WEIGHT_STEP): PhaseWeights[] {
  const ideal = GENRES[genre].ideal
  const triples = planTriples(step)
  const contribution = PHASES.map((phase) =>
    triples.map((t) => {
      const v = new Float64Array(SKILLS.length)
      phase.aspects.forEach((aspect, i) => {
        v[SKILLS.indexOf(aspect.skill)]! += (t[i]! / PHASES.length)
      })
      return v
    }),
  )
  const target = Float64Array.from(SKILLS.map((s) => ideal[s]))
  const uneven = triples.map((t) => t.reduce((sum, w) => sum + (w / 100 - 1 / 3) ** 2, 0) * 1e-4)
  const n = SKILLS.length
  let best = Infinity
  let pick: [number, number, number] = [0, 0, 0]
  const partial = new Float64Array(n)
  for (let i = 0; i < triples.length; i++) {
    for (let j = 0; j < triples.length; j++) {
      for (let s = 0; s < n; s++) partial[s] = contribution[0]![i]![s]! + contribution[1]![j]![s]! - target[s]!
      const base = uneven[i]! + uneven[j]!
      for (let k = 0; k < triples.length; k++) {
        const c = contribution[2]![k]!
        let diff = base + uneven[k]!
        for (let s = 0; s < n; s++) diff += Math.abs(partial[s]! + c[s]!)
        if (diff < best) {
          best = diff
          pick = [i, j, k]
        }
      }
    }
  }
  return pick.map((index) => triples[index]!)
}

const idealPlans = new Map<Genre, PhaseWeights[]>()

export function idealPhaseWeights(genre: Genre): PhaseWeights[] {
  let plan = idealPlans.get(genre)
  if (!plan) {
    plan = bestPhasePlan(genre)
    idealPlans.set(genre, plan)
  }
  return plan.map((w) => [...w] as PhaseWeights)
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
    focus: blendFocus([EQUAL_WEIGHTS, EQUAL_WEIGHTS, EQUAL_WEIGHTS]),
    phase: 0,
    awaitingPhase: true,
    phaseWeeksLeft: phaseLengths(weeks)[0]!,
    phaseWeights: [[...EQUAL_WEIGHTS], [...EQUAL_WEIGHTS], [...EQUAL_WEIGHTS]],
    phaseStart: emptyFocus(),
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
  const shares = phaseShares(project.phaseWeights[project.phase] ?? EQUAL_WEIGHTS)
  const aspects = PHASES[project.phase]!.aspects
  let bugs = project.bugs
  for (const e of state.staff) {
    if (e.burnoutWeeks > 0) continue
    let mult = WORK_RATE * (0.8 + e.morale / 250) * (0.85 + rng.next() * 0.3)
    if (e.traits.includes('perfectionist')) mult *= 0.9
    if (project.crunch) mult *= CRUNCH_OUTPUT * (e.traits.includes('nightOwl') ? 1.1 : 1)
    let output = 0
    aspects.forEach((aspect, i) => {
      const s = aspect.skill
      let gain = effectiveSkill(e, s) * shares[i]! * mult
      if (s === 'sound' && state.research.includes('soundStudio')) gain *= 1.2
      if (s === 'polish' && state.research.includes('playtests')) gain *= 1.1
      points[s] += gain
      output += gain
    })
    let bugRate = BUG_RATE * (1 - project.focus.polish / 200)
    if (project.crunch) bugRate *= CRUNCH_BUGS
    if (e.traits.includes('perfectionist')) bugRate *= 0.7
    bugs += output * bugRate
  }
  const phaseWeeksLeft = project.phaseWeeksLeft - 1
  const next = { ...project, points, bugs: Math.round(bugs * 10) / 10, weeksLeft: project.weeksLeft - 1, phaseWeeksLeft }
  if (phaseWeeksLeft > 0 || project.phase >= PHASES.length - 1) return next
  const phase = project.phase + 1
  return { ...next, phase, awaitingPhase: true, phaseWeeksLeft: phaseLengths(project.totalWeeks)[phase]! }
}

export function setPhaseFocus(state: GameState, weights: PhaseWeights): GameState {
  const project = state.project
  if (!project || !project.awaitingPhase) throw new Error('No phase waits for a decision.')
  if (weights.length !== 3 || weights.some((w) => !Number.isFinite(w))) throw new Error('A phase needs three weights.')
  const clean = weights.map((w) => clamp(Math.round(w), 0, PHASE_WEIGHT_MAX)) as PhaseWeights
  const phaseWeights = project.phaseWeights.map((w, i) => (i === project.phase ? clean : w))
  const next: GameProject = { ...project, phaseWeights, focus: blendFocus(phaseWeights), awaitingPhase: false, phaseStart: { ...project.points } }
  return log({ ...state, project: next }, `"${project.title}": phase ${project.phase + 1} of ${PHASES.length}, ${PHASES[project.phase]!.label}, starts.`)
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
  const phaseStart = {} as Record<Skill, number>
  const keep = 1 - share / state.project.totalWeeks
  for (const s of SKILLS) {
    points[s] = state.project.points[s] * keep
    phaseStart[s] = state.project.phaseStart[s] * keep
  }
  const project = { ...state.project, points, phaseStart, hype: Math.min(100, state.project.hype + DEV_DIARY_HYPE) }
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
