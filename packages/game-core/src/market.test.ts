import { describe, expect, it } from 'vitest'
import { createNewGame, projectQuality, startProject } from './index'
import { awardsShow, paySales, weeklyRivals } from './market'
import { createRng } from './rng'
import type { GameProject, GameState } from './types'
import { plan, runWeeks } from './testkit'

const base = () => createNewGame({ studioName: 'Market', founderName: 'Bo', archetype: 'artist', seed: 11 })

function project(state: GameState, overrides: Partial<GameProject>): GameProject {
  const p = startProject(state, plan()).project!
  return { ...p, points: { design: 30, tech: 30, art: 25, sound: 15, story: 0, polish: 15 }, weeksLeft: 0, ...overrides }
}

describe('quality and reviews', () => {
  it('rewards a fitting genre and topic', () => {
    const game = base()
    const great = projectQuality(game, project(game, { genre: 'platformer', topic: 'space' })).quality
    const bad = projectQuality(game, project(game, { genre: 'puzzle', topic: 'ninjas' })).quality
    expect(great).toBeGreaterThan(bad)
  })

  it('punishes an old engine', () => {
    const fresh = base()
    const late = { ...fresh, week: 52 * 8 + 1 }
    expect(projectQuality(late, project(fresh, {})).engine).toBeLessThan(-30)
    expect(projectQuality(fresh, project(fresh, {})).engine).toBe(0)
  })

  it('raises the bar with the calendar', () => {
    const game = base()
    const p = project(game, {})
    const early = projectQuality(game, p)
    const late = projectQuality({ ...game, week: 52 * 4 + 1 }, p)
    expect(late.quality - late.engine).toBeLessThan(early.quality - early.engine)
  })
})

describe('fan voice', () => {
  it('stays neutral while the studio has no fans yet', () => {
    const lonely: GameState = { ...base(), fandom: { ...base().fandom, mood: 5 } }
    const shipped = runWeeks(startProject(lonely, plan()), 12)
    const reviews = shipped.releases[0]!.reviews
    const fanVoice = reviews.find((r) => r.outlet === 'Fan Voice')!.score
    const pixelPost = reviews.find((r) => r.outlet === 'Pixel Post')!.score
    expect(Math.abs(fanVoice - pixelPost)).toBeLessThanOrEqual(1)
  })
})

describe('sales', () => {
  it('pays sales over many weeks after release', () => {
    const shipped = runWeeks(startProject(base(), plan()), 12)
    const release = shipped.releases[0]!
    expect(release.weeklySales.length).toBeGreaterThan(20)
    const later = paySales(shipped)
    expect(later.releases[0]!.totalSales).toBeGreaterThan(release.totalSales)
    expect(later.money).toBeGreaterThan(shipped.money)
  })
})

describe('rivals and awards', () => {
  it('rivals release games on their own schedule', () => {
    let game = base()
    const rng = createRng(5)
    for (let i = 0; i < 60; i++) game = weeklyRivals({ ...game, week: game.week + 1 }, rng)
    expect(game.rivalReleases.length).toBeGreaterThan(2)
  })

  it('gives Game of the Year to the best score of the year', () => {
    const game = base()
    const withGames: GameState = {
      ...game,
      week: 50,
      releases: [{ ...runWeeks(startProject(game, plan()), 12).releases[0]!, week: 30, score: 9.9, title: 'Best Game' }],
      rivalReleases: [{ rivalId: 'brickyard', title: 'Brick Quest', genre: 'puzzle', week: 20, score: 7 }],
    }
    const after = awardsShow(withGames)
    const goty = after.awards.find((a) => a.category === 'Game of the Year')!
    expect(goty.player).toBe(true)
    expect(after.fans).toBeGreaterThanOrEqual(withGames.fans)
  })
})
