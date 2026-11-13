import {
  BURNOUT_STRESS,
  BURNOUT_WEEKS,
  CANDIDATES_PER_MONTH,
  CANDIDATES_WITH_RECRUITER,
  CRUNCH_STRESS,
  FAST_LEARNER_BONUS,
  FIRE_COST_MONTHS,
  MORALE_CRUNCH,
  MORALE_QUIT_LINE,
  MORALE_QUIT_WEEKS,
  MORALE_REST,
  MORALE_START,
  MORALE_TEAM_PLAYER,
  OFFICES,
  REST_STRESS,
  SALARY_PER_SKILL_POINT,
  SKILL_CAP,
  TRAINING_COST,
  TRAINING_GAIN,
} from './balance'
import { FIRST_NAMES, LAST_NAMES, SKILLS } from './content'
import type { Rng } from './rng'
import type { Candidate, Employee, GameState, Role, Skill, Skills, Trait } from './types'
import { clamp, inflation, log, money } from './util'

const ROLE_FOCUS: Record<Role, Skill[]> = {
  coder: ['tech', 'polish'],
  artist: ['art', 'design'],
  designer: ['design', 'story'],
  sound: ['sound', 'polish'],
  writer: ['story', 'design'],
}

const ALL_TRAITS: Trait[] = ['fastLearner', 'workaholic', 'perfectionist', 'teamPlayer', 'diva', 'nightOwl', 'cheap', 'loyal']

export function averageSkill(skills: Skills): number {
  return SKILLS.reduce((sum, s) => sum + skills[s], 0) / SKILLS.length
}

export function effectiveSkill(employee: Employee, skill: Skill): number {
  let value = employee.skills[skill]
  if (employee.traits.includes('diva')) value *= 1.2
  if (employee.traits.includes('cheap')) value *= 0.9
  return value
}

export function capacity(state: GameState): number {
  return OFFICES[state.office].capacity
}

export function generateCandidates(state: GameState, rng: Rng): Candidate[] {
  const count = state.research.includes('recruiter') ? CANDIDATES_WITH_RECRUITER : CANDIDATES_PER_MONTH
  const year = 1980 + Math.floor((state.week - 1) / 52)
  const level = 3 + (year - 1980) * 0.45
  const roles: Role[] = ['coder', 'artist', 'designer', 'sound', 'writer']
  const candidates: Candidate[] = []
  for (let i = 0; i < count; i++) {
    const role = rng.pick(roles)
    const skills = {} as Skills
    for (const skill of SKILLS) {
      const strong = ROLE_FOCUS[role].includes(skill)
      skills[skill] = Math.max(1, Math.round(level * (strong ? 1.6 : 0.7) + rng.int(-2, 2)))
    }
    const traits: Trait[] = []
    if (rng.chance(0.7)) traits.push(rng.pick(ALL_TRAITS))
    if (rng.chance(0.2)) {
      const second = rng.pick(ALL_TRAITS)
      if (!traits.includes(second)) traits.push(second)
    }
    let salary = averageSkill(skills) * SALARY_PER_SKILL_POINT * inflation(state.week)
    if (traits.includes('diva')) salary *= 1.35
    if (traits.includes('cheap')) salary *= 0.8
    candidates.push({
      id: `cand-${state.week}-${i}`,
      name: `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`,
      role,
      kind: 'hire',
      skills,
      salary: Math.round(salary / 10) * 10,
      traits,
    })
  }
  return candidates
}

export function hire(state: GameState, candidateId: string): GameState {
  const candidate = state.candidates.find((c) => c.id === candidateId)
  if (!candidate) throw new Error('No such candidate.')
  if (state.staff.length >= capacity(state)) throw new Error('The office is full.')
  const employee: Employee = { ...candidate, id: `emp-${state.nextId}`, morale: MORALE_START, stress: 0, burnoutWeeks: 0, lowMoraleWeeks: 0, hiredWeek: state.week }
  const next: GameState = {
    ...state,
    nextId: state.nextId + 1,
    money: state.money - candidate.salary,
    staff: [...state.staff, employee],
    candidates: state.candidates.filter((c) => c.id !== candidateId),
  }
  return log(next, `${employee.name} joins as ${employee.role}. Hiring fee: ${money(candidate.salary)}.`, 'good')
}

export function fire(state: GameState, employeeId: string): GameState {
  const employee = state.staff.find((e) => e.id === employeeId)
  if (!employee) throw new Error('No such employee.')
  if (employee.kind === 'founder') throw new Error('You cannot fire yourself.')
  const cost = employee.salary * FIRE_COST_MONTHS
  const staff = state.staff.filter((e) => e.id !== employeeId).map((e) => ({ ...e, morale: clamp(e.morale - 4, 0, 100) }))
  return log({ ...state, money: state.money - cost, staff }, `${employee.name} leaves the studio. Severance: ${money(cost)}.`, 'bad')
}

export function train(state: GameState, employeeId: string, skill: Skill): GameState {
  if (!state.research.includes('trainingRoom')) throw new Error('Research the training room first.')
  const cost = Math.round(TRAINING_COST * inflation(state.week))
  const staff = state.staff.map((e) => {
    if (e.id !== employeeId) return e
    const gain = TRAINING_GAIN * (e.traits.includes('fastLearner') ? FAST_LEARNER_BONUS : 1)
    return { ...e, skills: { ...e.skills, [skill]: Math.min(SKILL_CAP, e.skills[skill] + gain) } }
  })
  const name = state.staff.find((e) => e.id === employeeId)?.name ?? 'Someone'
  return log({ ...state, money: state.money - cost, staff }, `${name} trains ${skill}. Cost: ${money(cost)}.`)
}

export function weeklyStaff(state: GameState, busy: boolean, crunch: boolean): GameState {
  const teamBonus = state.staff.filter((e) => e.traits.includes('teamPlayer')).length * MORALE_TEAM_PLAYER
  const spirit = state.research.includes('teamSpirit') ? 1 : 0
  let next = state
  const staff: Employee[] = []
  for (const e of state.staff) {
    let { morale, stress, burnoutWeeks, lowMoraleWeeks } = e
    if (burnoutWeeks > 0) {
      burnoutWeeks -= 1
      stress = Math.max(0, stress - 10)
    } else if (crunch && busy) {
      stress += e.traits.includes('workaholic') ? CRUNCH_STRESS / 2 : CRUNCH_STRESS
      morale += MORALE_CRUNCH
    } else {
      stress = Math.max(0, stress + REST_STRESS)
      if (!busy) morale += MORALE_REST
      if (e.traits.includes('workaholic')) morale -= 1
    }
    const ownTeamBonus = e.traits.includes('teamPlayer') ? teamBonus - MORALE_TEAM_PLAYER : teamBonus
    morale = clamp(morale + ownTeamBonus + spirit, 0, 100)
    if (stress >= BURNOUT_STRESS && burnoutWeeks === 0) {
      burnoutWeeks = BURNOUT_WEEKS
      next = log(next, `${e.name} burns out and stays home for ${BURNOUT_WEEKS} weeks.`, 'bad')
    }
    lowMoraleWeeks = morale < MORALE_QUIT_LINE ? lowMoraleWeeks + 1 : 0
    const quitLine = e.traits.includes('loyal') ? 10 : MORALE_QUIT_LINE
    if (e.kind !== 'founder' && morale < quitLine && lowMoraleWeeks >= MORALE_QUIT_WEEKS) {
      next = log(next, `${e.name} quits. The note on the desk says: "I need a life."`, 'bad')
      continue
    }
    staff.push({ ...e, morale, stress, burnoutWeeks, lowMoraleWeeks })
  }
  return { ...next, staff }
}

export function shiftMorale(state: GameState, delta: number): GameState {
  return { ...state, staff: state.staff.map((e) => ({ ...e, morale: clamp(e.morale + delta, 0, 100) })) }
}

export function monthlyCosts(state: GameState): number {
  return state.staff.reduce((sum, e) => sum + e.salary, 0) + Math.round(OFFICES[state.office].rent * inflation(state.week))
}

export function yearlyRaises(state: GameState): GameState {
  const staff = state.staff.map((e) => {
    if (e.kind !== 'hire') return e
    let fair = averageSkill(e.skills) * SALARY_PER_SKILL_POINT * inflation(state.week)
    if (e.traits.includes('diva')) fair *= 1.35
    if (e.traits.includes('cheap')) fair *= 0.8
    return { ...e, salary: Math.max(e.salary, Math.round(fair / 10) * 10) }
  })
  return { ...state, staff }
}
