import { describe, expect, it } from 'vitest'
import { GENRES, resolveEvent, PHASES, SIZES, SKILLS, advanceWeek, bestPhasePlan, blendFocus, createNewGame, focusFit, idealPhaseWeights, isBlocked, phaseLengths, phasePoints, phaseShares, setPhaseFocus, startProject } from './index'
import type { GameState, Genre, NewGameSetup, PhaseWeights } from './index'
import { plan } from './testkit'

const SETUP: NewGameSetup = { studioName: 'Test Studio', founderName: 'Alex', archetype: 'coder', seed: 7 }
const EVEN: PhaseWeights = [20, 20, 20]

function started() {
  return startProject(createNewGame(SETUP), plan())
}

function step(state: GameState) {
  let s = state
  while (s.pendingEvents.length > 0) s = resolveEvent(s, s.pendingEvents[0]!.choices[0]!.id)
  return advanceWeek(s)
}

function runPhase(state: ReturnType<typeof started>, weights: PhaseWeights = EVEN) {
  let s = setPhaseFocus(state, weights)
  while (s.project && !s.project.awaitingPhase && s.project.weeksLeft > 1) s = step(s)
  return s
}

describe('phases', () => {
  it('splits the work weeks over three phases as evenly as possible', () => {
    expect(PHASES).toHaveLength(3)
    expect(phaseLengths(SIZES.S.weeks)).toEqual([3, 2, 2])
    expect(phaseLengths(SIZES.M.weeks)).toEqual([5, 4, 4])
    expect(phaseLengths(SIZES.L.weeks)).toEqual([7, 7, 7])
  })

  it('gives every aspect one skill and every phase three different skills', () => {
    for (const phase of PHASES) expect(new Set(phase.aspects.map((a) => a.skill)).size).toBe(3)
    expect(new Set(PHASES.flatMap((p) => p.aspects.map((a) => a.skill)))).toEqual(new Set(SKILLS))
  })

  it('starts a game project that waits for the phase 1 decision', () => {
    const game = started()
    expect(game.project!.phase).toBe(0)
    expect(game.project!.awaitingPhase).toBe(true)
    expect(isBlocked(game)).toBe(true)
  })

  it('does not move the project forward while a phase decision waits', () => {
    const game = started()
    const next = advanceWeek(game)
    expect(next).toBe(game)
    expect(next.week).toBe(game.week)
  })

  it('stores the weights and lets the project continue', () => {
    const game = setPhaseFocus(started(), [60, 30, 10])
    expect(game.project!.awaitingPhase).toBe(false)
    expect(game.project!.phaseWeights[0]).toEqual([60, 30, 10])
    expect(advanceWeek(game).week).toBe(game.week + 1)
  })

  it('refuses a decision when no phase waits', () => {
    expect(() => setPhaseFocus(createNewGame(SETUP), EVEN)).toThrow()
    expect(() => setPhaseFocus(setPhaseFocus(started(), EVEN), EVEN)).toThrow(/No phase/)
  })

  it('turns weights into shares and gives all-zero weights equal shares', () => {
    expect(phaseShares([50, 25, 25])).toEqual([0.5, 0.25, 0.25])
    expect(phaseShares([0, 0, 0])).toEqual([1 / 3, 1 / 3, 1 / 3])
  })

  it('waits again when the weeks of a phase are used up', () => {
    const lengths = phaseLengths(SIZES.S.weeks)
    let game = setPhaseFocus(started(), EVEN)
    for (let i = 0; i < lengths[0]!; i++) game = step(game)
    expect(game.project!.phase).toBe(1)
    expect(game.project!.awaitingPhase).toBe(true)
    expect(game.project!.phaseWeeksLeft).toBe(lengths[1])
    expect(advanceWeek(game)).toBe(game)
  })

  it('plays all three phases and releases the game after the test week', () => {
    let game = started()
    for (let p = 0; p < 3; p++) {
      expect(game.project!.phase).toBe(p)
      game = runPhase(game)
    }
    expect(game.project!.weeksLeft).toBe(1)
    expect(game.project!.awaitingPhase).toBe(false)
    game = advanceWeek(game)
    expect(game.project).toBeNull()
    expect(game.releases).toHaveLength(1)
  })

  it('adds points only for the aspects of the running phase', () => {
    const phase1 = runPhase(started())
    const points = phase1.project!.points
    expect(points.tech).toBeGreaterThan(0)
    expect(points.design).toBeGreaterThan(0)
    expect(points.story).toBeGreaterThan(0)
    expect(points.art + points.sound + points.polish).toBe(0)
    const phase2 = runPhase(phase1)
    expect(phase2.project!.points.art).toBeGreaterThan(0)
    expect(phase2.project!.points.polish).toBe(0)
  })

  it('splits the points of a phase by the aspect shares', () => {
    const game = runPhase(started(), [100, 0, 0])
    const p = game.project!.points
    expect(p.tech).toBeGreaterThan(0)
    expect(p.design).toBe(0)
    expect(p.story).toBe(0)
  })

  it('reports the points gained in the phase that ended', () => {
    const phase1 = runPhase(started())
    const report = phasePoints(phase1.project!)
    for (const s of SKILLS) expect(report[s]).toBeCloseTo(phase1.project!.points[s])
    const phase2 = runPhase(phase1)
    expect(phasePoints(phase2.project!).tech).toBe(0)
    expect(phasePoints(phase2.project!).art).toBeGreaterThan(0)
  })

  it('keeps the weekly output on the level of an even plan whatever the weights', () => {
    const total = (weights: PhaseWeights) => {
      const p = runPhase(started(), weights).project!.points
      return SKILLS.reduce((sum, s) => sum + p[s], 0)
    }
    expect(total([80, 10, 10])).toBeGreaterThan(total(EVEN) * 0.6)
    expect(total([80, 10, 10])).toBeLessThan(total(EVEN) * 1.6)
  })
})

describe('effective focus', () => {
  it('adds up to 100 and counts each phase one third', () => {
    const focus = blendFocus([[1, 0, 0], [0, 1, 0], [1, 0, 0]])
    expect(SKILLS.reduce((sum, s) => sum + focus[s], 0)).toBeCloseTo(100)
    expect(focus.tech).toBeCloseTo(100 / 3)
    expect(focus.art).toBeCloseTo(100 / 3)
    expect(focus.polish).toBeCloseTo(100 / 3)
    expect(focus.design).toBe(0)
  })

  it('uses equal shares for phases that are not decided yet', () => {
    const game = started()
    const focus = game.project!.focus
    expect(focus.design).toBeCloseTo(100 / 9 + 100 / 9)
    expect(focus.tech).toBeCloseTo(100 / 9)
  })

  it('changes when a phase decision is stored', () => {
    const before = started().project!.focus
    const after = setPhaseFocus(started(), [100, 0, 0]).project!.focus
    expect(after.tech).toBeGreaterThan(before.tech)
    expect(after.story).toBeLessThan(before.story)
    expect(SKILLS.reduce((sum, s) => sum + after[s], 0)).toBeCloseTo(100)
  })
})

describe('ideal phase plan', () => {
  const genres = Object.keys(GENRES) as Genre[]

  it.each(genres)('lets a player reach nearly a perfect focus fit in %s', (genre) => {
    const best = bestPhasePlan(genre, 5)
    expect(focusFit(genre, blendFocus(best))).toBeGreaterThanOrEqual(0.97)
  })

  it.each(genres)('derives shares for %s that reach the same fit', (genre) => {
    const shares = idealPhaseWeights(genre)
    expect(shares).toHaveLength(3)
    for (const w of shares) expect(w[0] + w[1] + w[2]).toBe(100)
    expect(focusFit(genre, blendFocus(shares))).toBeGreaterThanOrEqual(0.97)
  })
})
