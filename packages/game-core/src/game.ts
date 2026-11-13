import { COMBO, DESIGN_WEIGHT, PAYDAY_EVERY_WEEKS, QUALITY_CAP, PRICE_PER_COPY, PROJECT_WEEKS, START_MONEY } from './balance'
import { nextRandom } from './rng'
import type { Employee, GameProject, GameState, ProjectPlan, Release } from './types'

const FOUNDERS: Employee[] = [
  { id: 'dev-01', name: 'Rusty', role: 'coder', skills: { design: 2, tech: 6 }, salary: 3000 },
  { id: 'dev-02', name: 'Mira', role: 'artist', skills: { design: 6, tech: 2 }, salary: 3000 },
  { id: 'dev-03', name: 'Tobi', role: 'producer', skills: { design: 4, tech: 3 }, salary: 3500 },
]

export function createNewGame(studioName: string, seed = 1): GameState {
  return {
    studioName,
    week: 1,
    money: START_MONEY,
    fans: 0,
    staff: FOUNDERS,
    project: null,
    releases: [],
    log: [{ week: 1, text: `${studioName} opens in a tiny rented room.` }],
    seed,
  }
}

export function startProject(state: GameState, plan: ProjectPlan): GameState {
  if (state.project) {
    throw new Error('A project is already in progress.')
  }
  const project: GameProject = { ...plan, weeksLeft: PROJECT_WEEKS, design: 0, tech: 0, bugs: 0 }
  return log({ ...state, project }, `Work starts on "${plan.title}".`)
}

export function advanceWeek(state: GameState): GameState {
  let next: GameState = { ...state, week: state.week + 1 }
  if (next.project) {
    next = work(next, next.project)
  }
  if (next.week % PAYDAY_EVERY_WEEKS === 0) {
    const payroll = next.staff.reduce((sum, e) => sum + e.salary, 0)
    next = log({ ...next, money: next.money - payroll }, `Payday: -$${payroll.toLocaleString('en-US')}.`)
  }
  return next
}

export function reviewScore(project: GameProject): number {
  const total = project.design + project.tech
  if (total === 0) return 1
  const target = DESIGN_WEIGHT[project.genre]
  const balance = 1 - Math.abs(project.design / total - target)
  const quality = Math.min(1, total / QUALITY_CAP)
  const bugPenalty = Math.min(0.4, project.bugs / Math.max(total, 1))
  const raw = 10 * quality * balance * COMBO[project.topic][project.genre] * (1 - bugPenalty)
  return Math.round(Math.max(1, Math.min(10, raw)) * 10) / 10
}

function work(state: GameState, project: GameProject): GameState {
  let seed = state.seed
  let { design, tech, bugs } = project
  for (const employee of state.staff) {
    let roll: number
    ;[roll, seed] = nextRandom(seed)
    const focus = 0.75 + roll * 0.5
    design += employee.skills.design * focus
    tech += employee.skills.tech * focus
    bugs += roll < 0.2 ? 1 : 0
  }
  const updated: GameProject = { ...project, design, tech, bugs, weeksLeft: project.weeksLeft - 1 }
  if (updated.weeksLeft > 0) {
    return { ...state, seed, project: updated }
  }
  return release({ ...state, seed, project: null }, updated)
}

function release(state: GameState, project: GameProject): GameState {
  const score = reviewScore(project)
  const fansGained = Math.round(score * score * 40)
  const sales = Math.round(2000 * score * (1 + state.fans / 5000))
  const entry: Release = { title: project.title, week: state.week, score, sales, fansGained }
  const next: GameState = {
    ...state,
    money: state.money + sales * PRICE_PER_COPY,
    fans: state.fans + fansGained,
    releases: [...state.releases, entry],
  }
  return log(next, `"${project.title}" ships. Critics give it ${score}/10. ${sales.toLocaleString('en-US')} copies sold.`)
}

function log(state: GameState, text: string): GameState {
  return { ...state, log: [...state.log, { week: state.week, text }] }
}
