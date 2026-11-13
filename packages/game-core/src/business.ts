import { CONTRACT_OFFERS, CONTRACT_PAY_PER_POINT, OFFICES } from './balance'
import { yearOf } from './calendar'
import { ENGINES, PLATFORMS, RESEARCH, SKILLS } from './content'
import type { Rng } from './rng'
import { effectiveSkill } from './staff'
import type { Contract, EngineId, GameState, OfficeLevel, PlatformId, ResearchId } from './types'
import { inflation, log, money } from './util'

const CLIENTS = [
  { client: 'Shady Pete Software', task: 'Port a chess game to the Vector 64' },
  { client: 'Bank of Sunvale', task: 'Make a screensaver with a golden coin' },
  { client: 'Mega Cereal Co.', task: 'Draw a mascot for a cereal box game' },
  { client: 'City Library', task: 'Write a spelling quiz for kids' },
  { client: 'Polka Records', task: 'Compose 12 jingles for a radio show' },
  { client: 'Dr. Byte Clinic', task: 'Fix bugs in a typing tutor' },
  { client: 'Toy Kingdom', task: 'Design a board game that beeps' },
  { client: 'Local TV 5', task: 'Animate a weather map' },
]

export function contractsOpen(state: GameState): boolean {
  return state.releases.length > 0
}

export function generateContracts(state: GameState, rng: Rng): Contract[] {
  if (!contractsOpen(state)) return []
  const team = state.staff.length
  return Array.from({ length: CONTRACT_OFFERS }, (_, i) => {
    const job = rng.pick(CLIENTS)
    const skill = rng.pick(SKILLS)
    const weeks = rng.int(3, 6)
    const required = Math.round(weeks * team * (3 + yearOf(state.week) - 1980) * (0.8 + rng.next() * 0.5))
    const pay = Math.round((required * CONTRACT_PAY_PER_POINT * inflation(state.week)) / 50) * 50
    return { id: `con-${state.week}-${i}`, client: job.client, task: job.task, skill, required, progress: 0, pay, penalty: Math.round(pay * 0.3), weeksLeft: weeks }
  })
}

export function takeContract(state: GameState, contractId: string): GameState {
  if (state.project || state.activeContract) throw new Error('The team is busy.')
  const contract = state.contracts.find((c) => c.id === contractId)
  if (!contract) throw new Error('No such contract.')
  return log({ ...state, activeContract: contract, contracts: state.contracts.filter((c) => c.id !== contractId) }, `Contract taken: ${contract.task} for ${contract.client}. Pays ${money(contract.pay)}.`)
}

export function workOnContract(state: GameState, rng: Rng): GameState {
  const contract = state.activeContract
  if (!contract) return state
  const gain = state.staff.filter((e) => e.burnoutWeeks === 0).reduce((sum, e) => sum + effectiveSkill(e, contract.skill) * (0.8 + e.morale / 250) * (0.85 + rng.next() * 0.3), 0)
  const updated = { ...contract, progress: contract.progress + gain, weeksLeft: contract.weeksLeft - 1 }
  if (updated.progress >= updated.required) {
    return log({ ...state, activeContract: null, money: state.money + updated.pay }, `Contract done for ${updated.client}: +${money(updated.pay)}.`, 'good')
  }
  if (updated.weeksLeft <= 0) {
    return log({ ...state, activeContract: null, money: state.money - updated.penalty }, `Contract failed. ${updated.client} wants ${money(updated.penalty)} back.`, 'bad')
  }
  return { ...state, activeContract: updated }
}

export function researchAvailable(state: GameState, id: ResearchId): boolean {
  const node = RESEARCH[id]
  return !state.research.includes(id) && (!node.requires || state.research.includes(node.requires))
}

export function buyResearch(state: GameState, id: ResearchId): GameState {
  const node = RESEARCH[id]
  if (!researchAvailable(state, id)) throw new Error('This research is not available.')
  if (state.researchPoints < node.rp) throw new Error('Not enough research points.')
  const cost = Math.round(node.cost * inflation(state.week))
  let next: GameState = { ...state, researchPoints: state.researchPoints - node.rp, money: state.money - cost, research: [...state.research, id] }
  if (id === 'engineBasics' || id === 'engineTools') {
    next = { ...next, ownEngine: { level: id === 'engineBasics' ? 1 : 2, year: yearOf(state.week) }, engines: next.engines.includes('own') ? next.engines : [...next.engines, 'own'] }
  }
  return log(next, `Research done: ${node.label}. Cost: ${money(cost)}.`, 'good')
}

export function buyPlatform(state: GameState, id: PlatformId): GameState {
  const platform = PLATFORMS[id]
  if (state.platforms.includes(id)) throw new Error('You already have this license.')
  if (platform.year > yearOf(state.week)) throw new Error('This platform is not out yet.')
  return log({ ...state, money: state.money - platform.license, platforms: [...state.platforms, id] }, `License bought: ${platform.label}. Cost: ${money(platform.license)}.`, 'good')
}

export function buyEngine(state: GameState, id: Exclude<EngineId, 'own'>): GameState {
  const engine = ENGINES[id]
  if (state.engines.includes(id)) throw new Error('You already have this engine.')
  if (engine.year > yearOf(state.week)) throw new Error('This engine is not out yet.')
  return log({ ...state, money: state.money - engine.fee, engines: [...state.engines, id] }, `Engine license: ${engine.label}. Cost: ${money(engine.fee)}.`, 'good')
}

export function canMove(state: GameState, office: OfficeLevel): boolean {
  return office === 'smallOffice' && state.office === 'garage' && state.milestones.includes('profitableYear')
}

export function moveOffice(state: GameState, office: OfficeLevel): GameState {
  if (!canMove(state, office)) throw new Error('You cannot move there yet.')
  const cost = Math.round(OFFICES[office].moveCost * inflation(state.week))
  return log({ ...state, office, money: state.money - cost }, `${state.studioName} moves out of the garage into a small office! Room for 6. Cost: ${money(cost)}.`, 'story')
}

type Milestone = { id: string; text: string; check: (s: GameState) => boolean }

export const MILESTONES: Milestone[] = [
  { id: 'firstGame', text: 'First game shipped. Contracts are open.', check: (s) => s.releases.length > 0 },
  { id: 'firstSeven', text: 'First score of 7+. The press knows your name.', check: (s) => s.releases.some((r) => r.score >= 7) },
  { id: 'sixStaff', text: 'Six people. This is a real studio now.', check: (s) => s.staff.length >= 6 },
  { id: 'firstLicense', text: 'First platform license. Hello, devkits.', check: (s) => s.platforms.length > 1 },
  { id: 'ownEngine', text: 'Your own engine runs. No more royalties.', check: (s) => s.ownEngine !== null },
]

export function checkMilestones(state: GameState): GameState {
  let next = state
  for (const m of MILESTONES) {
    if (!next.milestones.includes(m.id) && m.check(next)) {
      next = log({ ...next, milestones: [...next.milestones, m.id] }, `Milestone: ${m.text}`, 'story')
    }
  }
  return next
}

export function yearEnd(state: GameState): GameState {
  const profit = state.money - state.yearStartMoney
  let next: GameState = { ...state, yearStartMoney: state.money }
  if (profit > 0 && state.releases.length > 0 && !state.milestones.includes('profitableYear')) {
    next = log({ ...next, milestones: [...next.milestones, 'profitableYear'] }, `Milestone: first profitable year (+${money(profit)}). You can move into a small office now.`, 'story')
  }
  return next
}
