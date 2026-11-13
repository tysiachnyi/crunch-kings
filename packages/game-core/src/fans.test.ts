import { describe, expect, it } from 'vitest'
import { FAN_DEMAND_PATIENCE, FAN_REVIEW_BOMB_WEEKS, FAN_SEQUEL_FULFIL, createNewGame, resolveEvent, startProject, writeDevDiary } from './index'
import { fansReactToRelease, weeklyFans } from './fans'
import { createRng } from './rng'
import type { GameState, Release } from './types'
import { plan } from './testkit'

const base = () => createNewGame({ studioName: 'Fan Club', founderName: 'Al', archetype: 'designer', seed: 3 })

function release(score: number, extra: Partial<Release> = {}): Release {
  return {
    id: `rel-${score}`, title: `Game ${score}`, genre: 'arcade', topic: 'space', size: 'S', platform: 'vector64', week: 1, score,
    reviews: [], weeklySales: [], soldWeeks: [], badges: [], totalSales: 0, revenue: 0, unitRevenue: 10, fansGained: 0, onSaleWeeks: 0, hint: null, chartRank: 1, ...extra,
  }
}

function released(state: GameState, r: Release): GameState {
  return fansReactToRelease({ ...state, releases: [...state.releases, r] }, r, createRng(1))
}

describe('angry fans', () => {
  it('raises mood when a game beats the expectation and lowers it when it falls short', () => {
    const start = base()
    expect(released(start, release(8)).fandom.mood).toBeGreaterThan(start.fandom.mood)
    expect(released(start, release(2)).fandom.mood).toBeLessThan(start.fandom.mood)
  })

  it('limits the mood change of one release to -25..+20', () => {
    const start = base()
    expect(released(start, release(10)).fandom.mood - start.fandom.mood).toBeLessThanOrEqual(20 + 0)
    expect(released(start, release(1)).fandom.mood - start.fandom.mood).toBeGreaterThanOrEqual(-25)
  })

  it('sends an angry caps-lock letter after a big mood drop', () => {
    const game = released(base(), release(1))
    expect(game.pendingEvents.map((e) => e.id)).toContain('angryLetter')
  })

  it('opens a sequel demand after a hit, and a sequel fulfils it', () => {
    const hit = release(9, { id: 'rel-hit' })
    const withDemand = released(base(), hit)
    expect(withDemand.fandom.demands).toHaveLength(1)
    const mood = withDemand.fandom.mood
    const sequel = release(9, { id: 'rel-2', sequelOf: 'rel-hit' })
    const after = released(withDemand, sequel)
    expect(after.fandom.demands.filter((d) => d.target === 'rel-hit')).toHaveLength(0)
    expect(after.fandom.mood).toBeGreaterThanOrEqual(Math.min(100, mood + FAN_SEQUEL_FULFIL - 25))
  })

  it('review-bombs a release when the mood is below 25', () => {
    const angry = { ...base(), fandom: { ...base().fandom, mood: 10 } }
    expect(released(angry, release(5)).fandom.reviewBombWeeks).toBe(FAN_REVIEW_BOMB_WEEKS)
  })

  it('forgives everything after a hit when the mood was low', () => {
    const angry = { ...base(), fandom: { ...base().fandom, mood: 30 } }
    expect(released(angry, release(9)).fandom.mood).toBeGreaterThan(55)
  })

  it('turns an old demand into a petition, and ignoring it costs mood', () => {
    let game: GameState = { ...base(), week: 100, fandom: { ...base().fandom, demands: [{ id: 'd1', kind: 'sequel', text: 'A sequel to "X"', target: 'x', openedWeek: 100 - FAN_DEMAND_PATIENCE - 1, petitioned: false }] } }
    game = weeklyFans(game, createRng(2))
    expect(game.pendingEvents[0]?.id).toBe('petition')
    const mood = game.fandom.mood
    expect(resolveEvent(game, 'ignore').fandom.mood).toBe(mood - 5)
  })

  it('drifts the mood back toward 60', () => {
    const happy = { ...base(), fandom: { ...base().fandom, mood: 90 } }
    expect(weeklyFans(happy, createRng(1)).fandom.mood).toBeLessThan(90)
  })

  it('lifts the mood with a dev diary', () => {
    const game = startProject(base(), plan())
    expect(writeDevDiary(game).fandom.mood).toBe(game.fandom.mood + 6)
  })
})
