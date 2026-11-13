import {
  BADGE_HYPE,
  DAY_JITTER,
  DAYS_PER_WEEK,
  FAN_SALES_DIVISOR,
  FAN_SALES_MAX_BONUS,
  LONG_SELLER_UNITS,
  LONG_SELLER_WEEKS,
  REGION_JITTER,
  REGION_WIN_MARGIN,
  RIVAL_REACH_SHARE,
  RIVAL_SIZE_MULT,
  SALES_AUDIENCE_CAP,
  SALES_DAY_DECAY,
  SALES_RATE,
  SALES_SCORE_POWER,
  UNIT_TIER_UNITS,
  WEEKDAY_SHAPE,
  YEAR_BEST_MIN_WEEK,
} from './balance'
import { weekOfYear, yearOf } from './calendar'
import { GENRES, PLATFORMS, REGIONS, TOPICS, UNIT_TIERS } from './content'
import { audience, salesCurve } from './market'
import { hashUnit } from './rng'
import type { GameState, Genre, PlatformId, RegionId, Release, RivalRelease, SalesBadge, Topic } from './types'
import { log } from './util'

const REGION_IDS = Object.keys(REGIONS) as RegionId[]

export function apportion(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0)
  if (total <= 0 || sum <= 0) return weights.map(() => 0)
  const exact = weights.map((w) => (total * w) / sum)
  const parts = exact.map((x) => Math.floor(x))
  let rest = total - parts.reduce((a, b) => a + b, 0)
  const order = exact.map((x, i) => ({ i, frac: x - Math.floor(x) })).sort((a, b) => b.frac - a.frac || a.i - b.i)
  for (const { i } of order) {
    if (rest <= 0) break
    parts[i] = (parts[i] ?? 0) + 1
    rest -= 1
  }
  return parts
}

export function isOnSale(state: GameState, release: Release): boolean {
  const index = state.week - release.week
  return index >= 0 && index < release.weeklySales.length && release.soldWeeks.length > index
}

export function dailySales(release: Release, weekIndex: number): number[] {
  const units = release.soldWeeks[weekIndex]
  if (units === undefined) return []
  const weights = WEEKDAY_SHAPE.map((shape, day) => {
    const jitter = (hashUnit(`${release.id}:${weekIndex}:${day}`) - 0.5) * 2 * DAY_JITTER
    return shape * SALES_DAY_DECAY ** day * (1 + jitter)
  })
  return apportion(units, weights)
}

export type SalesView = { day: number; today: number; total: number; revenue: number; series: number[] }

export function salesView(release: Release, weekIndex: number, daysShown: number, limit = 28): SalesView {
  const last = Math.min(weekIndex, release.soldWeeks.length - 1)
  if (last < 0) return { day: 0, today: 0, total: 0, revenue: 0, series: [] }
  const shown = Math.max(1, Math.min(DAYS_PER_WEEK, daysShown))
  const first = Math.max(0, last - Math.ceil(limit / DAYS_PER_WEEK))
  const series: number[] = []
  for (let w = first; w < last; w++) series.push(...dailySales(release, w))
  series.push(...dailySales(release, last).slice(0, shown))
  let total = 0
  for (let w = 0; w < last; w++) total += release.soldWeeks[w] ?? 0
  total += dailySales(release, last).slice(0, shown).reduce((a, b) => a + b, 0)
  return { day: last * DAYS_PER_WEEK + shown, today: series[series.length - 1] ?? 0, total, revenue: total * release.unitRevenue, series: series.slice(-limit) }
}

export function marketScale(week: number): number {
  const size = (w: number) => (Object.keys(PLATFORMS) as PlatformId[]).reduce((sum, p) => sum + audience(p, w), 0)
  return size(week) / size(1)
}

export function unitTiers(week: number): { id: string; label: string; units: number }[] {
  const scale = marketScale(week)
  return UNIT_TIERS.map((t, i) => ({ id: t.id, label: t.label, units: Math.round((UNIT_TIER_UNITS[i] ?? 0) * scale) }))
}

function shares(genre: Genre, topic: Topic | null, key: string): Record<RegionId, number> {
  const tags = topic ? TOPICS[topic].tags : []
  const weights = REGION_IDS.map((id) => {
    const region = REGIONS[id]
    const genreTaste = region.genres[genre] ?? 1
    const tagTaste = tags.length ? tags.reduce((sum, t) => sum + (region.tags[t] ?? 1), 0) / tags.length : 1
    const jitter = (hashUnit(`${key}:${id}`) - 0.5) * 2 * REGION_JITTER
    return region.share * genreTaste * tagTaste * (1 + jitter)
  })
  const sum = weights.reduce((a, b) => a + b, 0)
  return Object.fromEntries(REGION_IDS.map((id, i) => [id, (weights[i] ?? 0) / sum])) as Record<RegionId, number>
}

export function regionalSales(release: Release, units = release.totalSales): Record<RegionId, number> {
  const s = shares(release.genre, release.topic, release.id)
  const parts = apportion(units, REGION_IDS.map((id) => s[id]))
  return Object.fromEntries(REGION_IDS.map((id, i) => [id, parts[i] ?? 0])) as Record<RegionId, number>
}

/**
 * Estimates the units of one rival release. Rivals have no sales numbers, so this follows the player's formula: the reach (the best platform audience of that year, scaled by RIVAL_REACH_SHARE) times SALES_RATE times the score power, a fixed size multiplier and the fan bonus from the rival's fans. The result is capped like the player's units and falls over the weeks with the same sales curve.
 */
export function rivalPlannedUnits(state: GameState, release: RivalRelease): number {
  const fans = state.rivals.find((r) => r.id === release.rivalId)?.fans ?? 0
  const reach = Math.max(...(Object.keys(PLATFORMS) as PlatformId[]).map((p) => audience(p, release.week))) * RIVAL_REACH_SHARE
  const fanMult = 1 + Math.min(FAN_SALES_MAX_BONUS, Math.sqrt(fans) / FAN_SALES_DIVISOR)
  return Math.round(Math.min(reach * SALES_AUDIENCE_CAP, reach * SALES_RATE * (release.score / 5) ** SALES_SCORE_POWER * RIVAL_SIZE_MULT * fanMult))
}

export function rivalWeeklyUnits(state: GameState, release: RivalRelease, week: number): number {
  const index = week - release.week
  if (index < 0) return 0
  return salesCurve(rivalPlannedUnits(state, release))[index] ?? 0
}

function rivalKey(release: RivalRelease): string {
  return `${release.rivalId}:${release.title}:${release.week}`
}

function ownYearUnits(release: Release, year: number): number {
  return release.soldWeeks.reduce((sum, units, i) => (yearOf(release.week + i) === year ? sum + units : sum), 0)
}

function rivalYearUnits(state: GameState, release: RivalRelease, year: number): number {
  const curve = salesCurve(rivalPlannedUnits(state, release))
  return curve.reduce((sum, units, i) => {
    const week = release.week + i
    return week <= state.week && yearOf(week) === year ? sum + units : sum
  }, 0)
}

function earned(release: Release, id: string): boolean {
  return release.badges.some((b) => b.id === id)
}

function earnBadges(state: GameState, release: Release, index: number): SalesBadge[] {
  const units = release.soldWeeks[index] ?? 0
  const week = state.week
  const year = yearOf(week)
  const won: SalesBadge[] = []
  const add = (id: string, label: string) => {
    if (!earned(release, id) && !won.some((b) => b.id === id)) won.push({ id, week, label })
  }
  const rivals = state.rivalReleases.filter((r) => week - r.week >= 0 && week - r.week < release.weeklySales.length)
  const rivalUnits = rivals.map((r) => ({ release: r, units: rivalWeeklyUnits(state, r, week) }))

  const position = state.releases.findIndex((r) => r.id === release.id)
  const earlier = state.releases.slice(0, Math.max(0, position))
  const best = Math.max(0, ...earlier.flatMap((r) => r.soldWeeks))
  if (earlier.length > 0 && units > best) add('record', 'New record')

  const tier = unitTiers(release.week)
    .filter((t) => release.totalSales >= t.units)
    .pop()
  if (tier) add(`tier:${tier.id}`, tier.label)

  if (rivalUnits.length > 0 && units > 0 && rivalUnits.every((r) => units > r.units)) add('bestseller', 'Bestseller of the week')

  if (weekOfYear(week) >= YEAR_BEST_MIN_WEEK) {
    const mine = ownYearUnits(release, year)
    const others = [
      ...state.releases.filter((r) => r.id !== release.id).map((r) => ownYearUnits(r, year)),
      ...state.rivalReleases.map((r) => rivalYearUnits(state, r, year)),
    ]
    if (others.some((u) => u > 0) && mine > 0 && others.every((u) => mine > u)) add('yearBest', `Best seller of ${year} so far`)
  }

  if (rivalUnits.length > 0 && units > 0 && !release.badges.some((b) => b.id.startsWith('region:') && b.week === week)) {
    const own = shares(release.genre, release.topic, release.id)
    const rivalShares = rivalUnits.map((r) => ({ units: r.units, shares: shares(r.release.genre, null, rivalKey(r.release)) }))
    const wins = REGION_IDS.filter((id) => !earned(release, `region:${id}`))
      .map((id) => ({ id, margin: (units * own[id]) / Math.max(1, ...rivalShares.map((r) => r.units * r.shares[id])) }))
      .filter((r) => r.margin > REGION_WIN_MARGIN)
      .sort((a, b) => b.margin - a.margin)
    const top = wins[0]
    if (top) add(`region:${top.id}`, `Most loved in ${REGIONS[top.id].label}`)
  }

  if (index >= LONG_SELLER_WEEKS && units >= LONG_SELLER_UNITS * marketScale(release.week)) add('longSeller', 'Long seller')
  return won
}

/** Awards the sales badges of the week. Each badge goes to a release once, gets a good log line and gives the studio BADGE_HYPE hype. The rules are: new record, unit tiers (scaled by the audience of the release year), bestseller of the week, best seller of the year so far, most loved in one region (at most one new region a week) and long seller. */
export function awardBadges(state: GameState): GameState {
  let next = state
  for (const release of state.releases) {
    const index = state.week - release.week
    if (index < 0 || release.soldWeeks.length !== index + 1) continue
    const won = earnBadges(next, release, index)
    if (won.length === 0) continue
    next = { ...next, releases: next.releases.map((r) => (r.id === release.id ? { ...r, badges: [...r.badges, ...won] } : r)) }
    for (const badge of won) {
      next = log({ ...next, hype: Math.min(100, next.hype + BADGE_HYPE) }, `Sales badge for "${release.title}": ${badge.label}.`, 'good')
    }
  }
  return next
}
