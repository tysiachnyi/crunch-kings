import { describe, expect, it } from 'vitest'
import { BADGE_HYPE, LONG_SELLER_UNITS, LONG_SELLER_WEEKS, REGIONS, UNIT_SCALE, advanceWeek, createNewGame, resolveEvent, setPhaseFocus, startProject } from './index'
import { awardBadges, dailySales, isOnSale, marketScale, regionalSales, rivalPlannedUnits, rivalWeeklyUnits, salesView, unitTiers } from './sales'
import { autoplay, plan, runWeeks } from './testkit'
import type { GameState, Release, RivalRelease } from './types'

const base = () => createNewGame({ studioName: 'Sales', founderName: 'Bo', archetype: 'coder', seed: 7 })

function shipped(): GameState {
  return runWeeks(startProject(base(), plan()), 12)
}

function release(state: GameState, over: Partial<Release>): Release {
  return { ...state.releases[0]!, badges: [], ...over }
}

function stateWith(releases: Release[], week: number, rivals: RivalRelease[] = []): GameState {
  return { ...base(), week, releases, rivalReleases: rivals, hype: 0 }
}

function rival(over: Partial<RivalRelease> = {}): RivalRelease {
  return { rivalId: 'brickyard', title: 'Brick Quest', genre: 'puzzle', week: 20, score: 6, ...over }
}

function ids(state: GameState, index = 0): string[] {
  return state.releases[index]!.badges.map((b) => b.id)
}

describe('daily sales', () => {
  it('records the real units of every week on sale', () => {
    const game = shipped()
    const r = game.releases[0]!
    expect(r.soldWeeks.length).toBe(r.onSaleWeeks)
    expect(r.soldWeeks.reduce((a, b) => a + b, 0)).toBe(r.totalSales)
  })

  it('splits a week into 7 days that add up to the week', () => {
    const r = shipped().releases[0]!
    for (let units = 0; units < 3000; units += 137) {
      for (let week = 0; week < 5; week++) {
        const days = dailySales({ ...r, id: `rel-${units}`, soldWeeks: Array(5).fill(units) }, week)
        expect(days).toHaveLength(7)
        expect(days.reduce((a, b) => a + b, 0)).toBe(units)
        expect(days.every((d) => Number.isInteger(d) && d >= 0)).toBe(true)
      }
    }
  })

  it('is deterministic and gives the weekend more than the weekdays', () => {
    const r = { ...shipped().releases[0]!, soldWeeks: Array(30).fill(7000) }
    expect(dailySales(r, 3)).toEqual(dailySales({ ...r }, 3))
    expect(dailySales(r, 3)).not.toEqual(dailySales({ ...r, id: 'other' }, 3))
    let weekend = 0
    let early = 0
    for (let w = 0; w < 30; w++) {
      const d = dailySales(r, w)
      weekend += d[5]! + d[6]!
      early += d[0]! + d[1]!
    }
    expect(weekend).toBeGreaterThan(early * 1.3)
  })

  it('returns no days for a week that is not sold yet', () => {
    const r = shipped().releases[0]!
    expect(dailySales(r, r.soldWeeks.length)).toEqual([])
  })

  it('shows a total that matches the core total when the week is revealed', () => {
    const game = runWeeks(startProject(base(), plan()), 20)
    const r = game.releases[0]!
    const index = game.week - r.week
    const full = salesView(r, index, 7)
    expect(full.total).toBe(r.totalSales)
    expect(full.revenue).toBeCloseTo(r.revenue, 5)
    expect(full.day).toBe(index * 7 + 7)
    let previous = salesView(r, index, 1)
    for (let d = 2; d <= 7; d++) {
      const view = salesView(r, index, d)
      expect(view.total).toBeGreaterThanOrEqual(previous.total)
      previous = view
    }
    expect(salesView(r, index, 7).series.length).toBeLessThanOrEqual(28)
    expect(isOnSale(game, r)).toBe(true)
  })
})

describe('unit scale', () => {
  it('keeps the revenue of a release equal to units times the studio cut per copy', () => {
    const game = runWeeks(startProject(base(), plan()), 40)
    const r = game.releases[0]!
    expect(r.totalSales).toBeGreaterThan(0)
    expect(r.revenue).toBeCloseTo(r.totalSales * r.unitRevenue, 5)
    expect(r.unitRevenue).toBeLessThan(1)
    expect(r.weeklySales.reduce((a, b) => a + b, 0)).toBeGreaterThan(1000)
  })

  it('sells a first game of 1980 with a first-try score of 3 to 5 between 2,000 and 10,000 copies', () => {
    let game = startProject(base(), plan())
    for (let i = 0; i < 40; i++) {
      while (game.pendingEvents.length > 0) game = resolveEvent(game, game.pendingEvents[0]!.choices[0]!.id)
      while (game.project?.awaitingPhase) game = setPhaseFocus(game, game.project.phaseWeights[game.project.phase]!)
      game = advanceWeek(game)
    }
    const r = game.releases[0]!
    expect(r.score).toBeGreaterThanOrEqual(3)
    expect(r.score).toBeLessThanOrEqual(5)
    expect(r.totalSales).toBeGreaterThanOrEqual(2000)
    expect(r.totalSales).toBeLessThanOrEqual(10000)
    expect(r.fansGained).toBeLessThan(r.totalSales / UNIT_SCALE)
  })

  it('gains fans from copies divided by the unit scale', () => {
    const game = runWeeks(startProject(base(), plan()), 12)
    const r = game.releases[0]!
    const planned = r.weeklySales.reduce((a, b) => a + b, 0)
    expect(r.fansGained).toBeLessThanOrEqual(Math.round((planned / UNIT_SCALE) * 0.15) + 1)
  })
})

describe('regions', () => {
  it('splits the sales of a release over the regions without a remainder', () => {
    const r = shipped().releases[0]!
    for (const units of [0, 1, 7, 999, 123457]) {
      const split = regionalSales(r, units)
      expect(Object.keys(split).sort()).toEqual(Object.keys(REGIONS).sort())
      expect(Object.values(split).reduce((a, b) => a + b, 0)).toBe(units)
    }
    expect(regionalSales(r)).toEqual(regionalSales({ ...r }))
  })

  it('follows the taste of each region', () => {
    const r = shipped().releases[0]!
    const rpg = regionalSales({ ...r, id: 'x', genre: 'rpg', topic: 'fantasy' }, 100000)
    const sports = regionalSales({ ...r, id: 'x', genre: 'sports', topic: 'cooking' }, 100000)
    expect(rpg.japan / sports.japan).toBeGreaterThan(sports.brazil / rpg.brazil)
    expect(sports.usa).toBeGreaterThan(rpg.germany)
  })
})

describe('rival estimate', () => {
  it('is deterministic and grows with the score', () => {
    const game = base()
    const low = rival({ score: 4 })
    const high = rival({ score: 8 })
    expect(rivalPlannedUnits(game, low)).toBe(rivalPlannedUnits(game, { ...low }))
    expect(rivalPlannedUnits(game, high)).toBeGreaterThan(rivalPlannedUnits(game, low))
    expect(rivalWeeklyUnits(game, high, 20)).toBeGreaterThan(rivalWeeklyUnits(game, high, 30))
    expect(rivalWeeklyUnits(game, high, 19)).toBe(0)
  })
})

describe('sales badges', () => {
  const week = 30

  it('gives a new record when a week beats every earlier game, but not for the first game', () => {
    const r = shipped().releases[0]!
    const old = release(shipped(), { id: 'old', week: 5, soldWeeks: [100, 50], totalSales: 150 })
    const newer = release(shipped(), { id: 'new', week, soldWeeks: [150], totalSales: 150 })
    expect(ids(awardBadges(stateWith([old, newer], week)), 1)).toContain('record')
    const tie = { ...newer, soldWeeks: [100] }
    expect(ids(awardBadges(stateWith([old, tie], week)), 1)).not.toContain('record')
    expect(ids(awardBadges(stateWith([{ ...r, id: 'first', week, soldWeeks: [999999], totalSales: 999999, badges: [] }], week)))).not.toContain('record')
  })

  it('gives the highest unit tier once, and scales the tiers with the year', () => {
    const r = release(shipped(), { week, soldWeeks: [10], totalSales: 2100 * UNIT_SCALE })
    const after = awardBadges(stateWith([r], week))
    expect(ids(after)).toContain('tier:big')
    expect(ids(after)).not.toContain('tier:cult')
    const again = awardBadges({ ...after, week })
    expect(ids(again).filter((id) => id === 'tier:big')).toHaveLength(1)
    const late = 52 * 8 + 5
    const tiers = unitTiers(late)
    expect(tiers[0]!.units).toBeGreaterThan(unitTiers(1)[0]!.units * 3)
    expect(marketScale(late)).toBeGreaterThan(marketScale(1))
    const lateGame = release(shipped(), { week: late, soldWeeks: [10], totalSales: 2100 * UNIT_SCALE })
    expect(ids(awardBadges(stateWith([lateGame], late)))).not.toContain('tier:big')
    const legend = release(shipped(), { week: late, soldWeeks: [10], totalSales: tiers[3]!.units })
    expect(ids(awardBadges(stateWith([legend], late)))).toContain('tier:legend')
  })

  it('gives bestseller of the week only when every rival release on sale is outsold', () => {
    const rivals = [rival({ week: week - 2, score: 9 })]
    const strong = release(shipped(), { week, soldWeeks: [50000], totalSales: 50000 })
    const weak = release(shipped(), { week, soldWeeks: [1], totalSales: 1 })
    expect(ids(awardBadges(stateWith([strong], week, rivals)))).toContain('bestseller')
    expect(ids(awardBadges(stateWith([weak], week, rivals)))).not.toContain('bestseller')
    expect(ids(awardBadges(stateWith([strong], week, [])))).not.toContain('bestseller')
    const mid = release(shipped(), { week, soldWeeks: [100], totalSales: 100 })
    expect(ids(awardBadges(stateWith([mid], week, [rival({ week, score: 10 })])))).not.toContain('bestseller')
  })

  it('gives the best seller of the year so far when the game beats all rivals and own games', () => {
    const w = 52 * 3 + 30
    const mine = release(shipped(), { id: 'mine', week: w - 5, soldWeeks: Array(6).fill(5000 * UNIT_SCALE), totalSales: 30000 * UNIT_SCALE })
    const own = release(shipped(), { id: 'own', week: w - 20, soldWeeks: Array(21).fill(10 * UNIT_SCALE), totalSales: 210 * UNIT_SCALE })
    const rivals = [rival({ week: w - 10, score: 6 })]
    expect(ids(awardBadges(stateWith([own, mine], w, rivals)), 1)).toContain('yearBest')
    const beaten = { ...own, soldWeeks: Array(21).fill(2000 * UNIT_SCALE), totalSales: 42000 * UNIT_SCALE }
    expect(ids(awardBadges(stateWith([beaten, mine], w, rivals)), 1)).not.toContain('yearBest')
    const early = 52 * 3 + 3
    expect(ids(awardBadges(stateWith([{ ...mine, week: early - 2, soldWeeks: Array(3).fill(5000 * UNIT_SCALE) }], early, [rival({ week: early - 1 })])))).not.toContain('yearBest')
  })

  it('gives at most one new region badge a week and each region once', () => {
    const rivals = [rival({ week: week - 1, score: 5 })]
    let state = stateWith([release(shipped(), { week, soldWeeks: [], totalSales: 0 })], week, rivals)
    const seen: string[] = []
    for (let i = 0; i < 12; i++) {
      const r = state.releases[0]!
      state = { ...state, week: week + i, releases: [{ ...r, soldWeeks: [...r.soldWeeks, 100000] }] }
      const before = ids(state).filter((id) => id.startsWith('region:'))
      state = awardBadges(state)
      const after = ids(state).filter((id) => id.startsWith('region:'))
      expect(after.length - before.length).toBeLessThanOrEqual(1)
      seen.push(...after)
    }
    const regions = ids(state).filter((id) => id.startsWith('region:'))
    expect(regions.length).toBeGreaterThanOrEqual(3)
    expect(new Set(regions).size).toBe(regions.length)
  })

  it('gives long seller after enough weeks above the floor', () => {
    const floor = Math.ceil(LONG_SELLER_UNITS * marketScale(week))
    const make = (index: number, units: number) => {
      const sold = [...Array(index).fill(floor * 3), units]
      return release(shipped(), { week: week - index, soldWeeks: sold, totalSales: 0 })
    }
    expect(ids(awardBadges(stateWith([make(LONG_SELLER_WEEKS, floor)], week)))).toContain('longSeller')
    expect(ids(awardBadges(stateWith([make(LONG_SELLER_WEEKS - 1, floor)], week)))).not.toContain('longSeller')
    expect(ids(awardBadges(stateWith([make(LONG_SELLER_WEEKS, floor - 1)], week)))).not.toContain('longSeller')
  })

  it('logs each badge as good news, adds hype and never repeats a badge', () => {
    const strong = release(shipped(), { week, soldWeeks: [50000], totalSales: 50000 })
    const start = stateWith([strong], week, [rival({ week: week - 2 })])
    const once = awardBadges(start)
    const count = once.releases[0]!.badges.length
    expect(count).toBeGreaterThan(1)
    expect(once.log.filter((l) => l.tone === 'good' && l.text.startsWith('Sales badge'))).toHaveLength(count)
    expect(once.hype).toBe(count * BADGE_HYPE)
    const twice = awardBadges(once)
    expect(twice.releases[0]!.badges).toHaveLength(count)
    expect(twice.hype).toBe(once.hype)
  })

  it('earns some badges in a whole demo, and the bot still finishes it', () => {
    const game = autoplay(base(), 520)
    expect(game.ending).toBe('demoComplete')
    const all = game.releases.flatMap((r) => r.badges)
    expect(all.length).toBeGreaterThan(5)
    expect(game.releases.some((r) => r.badges.length === 0)).toBe(true)
    for (const r of game.releases) expect(r.soldWeeks.reduce((a, b) => a + b, 0)).toBe(r.totalSales)
    const poor = autoplay(base(), 520, false)
    expect(poor.ending).toBe('demoComplete')
  })
})
