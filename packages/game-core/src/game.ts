import { FAN_MOOD_START, HYPE_DECAY, RP_IDLE_PER_STAFF, RP_WORK_PER_STAFF, START_MONEY } from './balance'
import { checkMilestones, generateContracts, workOnContract, yearEnd } from './business'
import { dateLabel, demoEndWeek, isNewMonth, isNewYear, weekOfYear } from './calendar'
import { resolveEvent as resolveEventWith, storyOnRelease, weeklyEvents } from './events'
import { weeklyFans } from './fans'
import { awardBadges } from './sales'
import { awardsShow, initialRivals, nominations, paySales, releaseGame, weeklyRivals, yearlyRivals } from './market'
import { workOnProject } from './project'
import { createRng } from './rng'
import { createFounder, createGarageFriend } from './founders'
import { generateCandidates, monthlyCosts, weeklyStaff, yearlyRaises } from './staff'
import type { GameState, NewGameSetup } from './types'
import { log, money } from './util'

export function createNewGame({ studioName, founderName, archetype, seed = 1 }: NewGameSetup): GameState {
  const rng = createRng(seed)
  const founder = createFounder(founderName, archetype)
  const friend = createGarageFriend(archetype)
  const state: GameState = {
    version: 6,
    studioName,
    founderArchetype: archetype,
    week: 1,
    money: START_MONEY,
    fans: 0,
    hype: 0,
    researchPoints: 0,
    research: [],
    platforms: ['vector64'],
    engines: ['tinker'],
    ownEngine: null,
    office: 'garage',
    staff: [founder, friend],
    candidates: [],
    contracts: [],
    activeContract: null,
    project: null,
    releases: [],
    rivals: initialRivals(rng),
    rivalReleases: [],
    fandom: { mood: FAN_MOOD_START, demands: [], reviewBombWeeks: 0, lastLetterWeek: 0 },
    modifiers: [],
    pendingEvents: [],
    awards: [],
    milestones: [],
    log: [],
    loan: null,
    negativeWeeks: 0,
    yearStartMoney: START_MONEY,
    rescueStep: 0,
    ending: null,
    lastReleaseId: null,
    firedEvents: {},
    seed: rng.seed,
    nextId: 1,
  }
  const withCandidates = { ...state, candidates: generateCandidates(state, rng), seed: rng.seed }
  return log(withCandidates, `January 1980. ${founder.name} and ${friend.name} open ${studioName} in a garage with a used computer and ${money(START_MONEY)} from selling a car.`, 'story')
}

export function isBlocked(state: GameState): boolean {
  return state.ending !== null || state.pendingEvents.length > 0 || state.project?.awaitingPhase === true
}

export function advanceWeek(state: GameState): GameState {
  if (isBlocked(state)) return state
  const rng = createRng(state.seed)
  let s: GameState = { ...state, week: state.week + 1 }

  if (s.week >= demoEndWeek()) {
    return log({ ...s, ending: 'demoComplete' }, `${dateLabel(s.week)}. The 80s are over. ${s.studioName} survived the garage years.`, 'story')
  }

  const busy = s.project !== null || s.activeContract !== null
  const crunch = s.project?.crunch ?? false
  const team = s.staff.length

  if (s.project) {
    const project = workOnProject(s, s.project, rng)
    if (project.weeksLeft <= 0) {
      s = storyOnRelease(releaseGame({ ...s, project }, project, rng))
    } else {
      s = { ...s, project: { ...project, hype: Math.max(0, project.hype - HYPE_DECAY / 2) } }
    }
  } else if (s.activeContract) {
    s = workOnContract(s, rng)
  }

  s = { ...s, researchPoints: s.researchPoints + team * (busy ? RP_WORK_PER_STAFF : RP_IDLE_PER_STAFF) }
  s = weeklyStaff(s, busy, crunch)
  s = paySales(s)
  s = { ...s, hype: Math.max(0, s.hype - HYPE_DECAY) }
  s = { ...s, modifiers: s.modifiers.map((m) => ({ ...m, weeksLeft: m.weeksLeft - 1 })).filter((m) => m.weeksLeft > 0) }

  if (isNewMonth(s.week)) {
    const costs = monthlyCosts(s)
    s = log({ ...s, money: s.money - costs }, `Salaries and rent: -${money(costs)}.`)
    s = { ...s, candidates: generateCandidates(s, rng), contracts: generateContracts(s, rng) }
  }
  if (isNewYear(s.week)) {
    s = yearlyRaises(yearEnd(s))
    s = yearlyRivals(s, rng)
  }
  s = weeklyRivals(s, rng)
  s = awardBadges(s)
  if (weekOfYear(s.week) === 48) s = nominations(s)
  if (weekOfYear(s.week) === 50) s = awardsShow(s)
  s = weeklyFans(s, rng)
  s = weeklyEvents(s, rng)
  s = checkMilestones(s)
  return { ...s, seed: rng.seed }
}

export function resolveEvent(state: GameState, choiceId: string): GameState {
  const rng = createRng(state.seed)
  const next = resolveEventWith(state, choiceId, rng)
  return { ...next, seed: rng.seed }
}
