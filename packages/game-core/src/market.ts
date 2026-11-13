import {
  AWARD_FANS,
  AWARD_HYPE,
  FAN_REVIEW_BOMB_MOOD,
  FAN_REVIEW_BOMB_SALES,
  FAN_REVIEW_BOMB_SCORE,
  FAN_SALES_DIVISOR,
  FAN_SALES_MAX_BONUS,
  SALES_AUDIENCE_CAP,
  FANS_PER_COPY,
  FLOP_SCORE,
  HIT_SCORE,
  MORALE_FLOP,
  MORALE_HIT,
  NOMINATION_HYPE,
  RIVAL_CLASH_SALES,
  RIVAL_CLASH_SAME_GENRE,
  RIVAL_CLASH_WEEKS,
  RP_PER_SCORE,
  SALES_DECAY,
  SALES_RATE,
  SALES_SCORE_POWER,
  SALES_TAIL_WEEKS,
  SIZES,
  SKILL_CAP,
  SKILL_GAIN_PER_RELEASE,
  UNIT_SCALE,
} from './balance'
import { yearOf } from './calendar'
import { ENGINES, GENRES, OUTLETS, PLATFORMS, REVIEW_QUOTES, RIVAL_NAME_PARTS, RIVAL_SEEDS, RIVAL_TITLE_PARTS, SKILLS, TOPICS } from './content'
import { fansReactToRelease } from './fans'
import { projectQuality, weakestSkill } from './project'
import type { Rng } from './rng'
import { shiftMorale } from './staff'
import type { Award, GameProject, GameState, Genre, Release, Review, Rival, RivalRelease, Skill } from './types'
import { clamp, fill, inflation, log, round1 } from './util'

export function audience(platform: keyof typeof PLATFORMS, week: number): number {
  const table = PLATFORMS[platform].audience
  const index = clamp(yearOf(week) - 1980, 0, table.length - 1)
  return (table[index] ?? 0) * 1000 * UNIT_SCALE
}

function reviewFor(state: GameState, project: GameProject, aspect: (typeof OUTLETS)[number]['aspect'], base: number, rng: Rng): number {
  const tags = GENRES[project.genre].tags
  const ideal = GENRES[project.genre].ideal
  let score = base
  if (aspect === 'tech') score += (project.focus.tech - ideal.tech) / 15 + (project.engine === 'own' ? 0.4 : 0)
  if (aspect === 'action') score += tags.includes('action') ? 0.7 : -0.7
  if (aspect === 'brains') score += tags.includes('brains') ? 0.7 : -0.5
  if (aspect === 'story') score += clamp((project.focus.story - 10) / 15, -1.5, 1.5)
  if (aspect === 'fans' && state.fans >= 50) {
    score += ((state.fandom.mood - 50) / 50) * 1.5
    if (state.fandom.mood < FAN_REVIEW_BOMB_MOOD) score -= FAN_REVIEW_BOMB_SCORE
  }
  score += (rng.next() - 0.5)
  return Math.round(clamp(score, 1, 10))
}

function quoteFor(state: GameState, project: GameProject, aspect: (typeof OUTLETS)[number]['aspect'], score: number, rng: Rng): string {
  const [good, mid, bad] = REVIEW_QUOTES[aspect === 'fans' && state.fans < 50 ? 'balanced' : aspect]
  const pool = score >= 7.5 ? good : score >= 5 ? mid : bad
  return fill(rng.pick(pool), { title: project.title, topic: TOPICS[project.topic].label.toLowerCase(), studio: state.studioName.toUpperCase() })
}

function hintFor(state: GameState, project: GameProject, score: number): string | null {
  if (score >= 9.5) return null
  const q = projectQuality(state, project)
  const skill: Skill | null = weakestSkill(project)
  if (q.bugs < -10) return 'Too many bugs. A longer test or less crunch would help.'
  if (q.engine < -6) return 'Your engine is old. Critics noticed.'
  if (q.combo < 0) return `${GENRES[project.genre].label} and ${TOPICS[project.topic].label} do not mix well.`
  if (skill) return `More ${skill} would have helped this ${GENRES[project.genre].label.toLowerCase()}.`
  if (q.fatigue < 0) return 'Players are tired of this genre from you.'
  return 'A bigger or more skilled team would push the score higher.'
}

function clashMultiplier(state: GameState, genre: Genre): number {
  let mult = 1
  for (const r of state.rivalReleases) {
    if (Math.abs(r.week - state.week) > RIVAL_CLASH_WEEKS) continue
    mult *= r.genre === genre ? RIVAL_CLASH_SAME_GENRE : RIVAL_CLASH_SALES
  }
  for (const r of state.rivals) {
    if (r.alive && r.nextReleaseWeek - state.week <= RIVAL_CLASH_WEEKS && r.nextReleaseWeek >= state.week) mult *= RIVAL_CLASH_SALES
  }
  return Math.max(0.5, mult)
}

export function salesCurve(total: number): number[] {
  const raw = Array.from({ length: SALES_TAIL_WEEKS }, (_, i) => (1 - SALES_DECAY) ** i)
  const sum = raw.reduce((a, b) => a + b, 0)
  return raw.map((r) => Math.round((total * r) / sum))
}

export function chartRank(state: GameState, score: number): number {
  const window = state.rivalReleases.filter((r) => Math.abs(r.week - state.week) <= 6)
  return window.filter((r) => r.score > score).length + 1
}

export function releaseGame(state: GameState, project: GameProject, rng: Rng): GameState {
  const q = projectQuality(state, project)
  const base = q.quality / 10
  const reviews: Review[] = OUTLETS.map((o) => {
    const score = reviewFor(state, project, o.aspect, base, rng)
    return { outlet: o.name, score, quote: quoteFor(state, project, o.aspect, score, rng) }
  })
  const score = round1(reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length)
  const platform = PLATFORMS[project.platform]
  const likes = GENRES[project.genre].tags.some((t) => platform.likes.includes(t)) ? 1.15 : 1
  const moodMult = 0.7 + state.fandom.mood / 200
  const hypeMult = Math.min(2, 1 + (project.hype + state.hype) / 100)
  const fanMult = 1 + Math.min(FAN_SALES_MAX_BONUS, Math.sqrt(state.fans) / FAN_SALES_DIVISOR)
  const sequelMult = project.sequelOf ? 1.25 : 1
  const reach = audience(project.platform, state.week)
  const units = Math.round(
    Math.min(reach * SALES_AUDIENCE_CAP, reach * SALES_RATE * (score / 5) ** SALES_SCORE_POWER * SIZES[project.size].salesMult * likes * moodMult * hypeMult * fanMult * sequelMult * clashMultiplier(state, project.genre)),
  )
  const royalty = project.engine === 'own' ? 0 : ENGINES[project.engine].royalty
  const price = SIZES[project.size].price * inflation(state.week)
  const unitRevenue = Math.max(1, price * (1 - royalty) - platform.unitCost) / UNIT_SCALE
  const fansGained = Math.round((units / UNIT_SCALE) * (score / 10) ** 2 * FANS_PER_COPY)
  const id = `rel-${state.nextId}`
  const release: Release = {
    id,
    title: project.title,
    genre: project.genre,
    topic: project.topic,
    size: project.size,
    platform: project.platform,
    week: state.week,
    score,
    reviews,
    weeklySales: salesCurve(units),
    soldWeeks: [],
    badges: [],
    totalSales: 0,
    revenue: 0,
    unitRevenue,
    fansGained,
    onSaleWeeks: 0,
    hint: hintFor(state, project, score),
    chartRank: chartRank(state, score),
    ...(project.sequelOf ? { sequelOf: project.sequelOf } : {}),
  }
  const topSkills = [...SKILLS].sort((a, b) => project.focus[b] - project.focus[a]).slice(0, 2)
  const staff = state.staff.map((e) => {
    const skills = { ...e.skills }
    for (const s of topSkills) skills[s] = Math.min(SKILL_CAP, skills[s] + SKILL_GAIN_PER_RELEASE)
    return { ...e, skills }
  })
  let next: GameState = {
    ...state,
    nextId: state.nextId + 1,
    project: null,
    staff,
    fans: state.fans + fansGained,
    hype: Math.round(state.hype / 2),
    releases: [...state.releases, release],
    researchPoints: state.researchPoints + Math.round(score * RP_PER_SCORE + SIZES[project.size].qualityBonus),
    lastReleaseId: id,
  }
  next = log(next, `"${project.title}" ships on ${platform.label}. Critics: ${score}/10. Chart rank #${release.chartRank}.`, score >= 7 ? 'good' : score < 5 ? 'bad' : undefined)
  if (score >= HIT_SCORE) next = shiftMorale(next, MORALE_HIT)
  if (score < FLOP_SCORE) {
    next = shiftMorale(next, MORALE_FLOP)
    const divas = next.staff.filter((e) => e.traits.includes('diva') && e.kind === 'hire')
    for (const d of divas) next = log({ ...next, staff: next.staff.filter((e) => e.id !== d.id) }, `${d.name} the diva leaves: "I deserve better reviews."`, 'bad')
  }
  return fansReactToRelease(next, release, rng)
}

export function paySales(state: GameState): GameState {
  let income = 0
  const salesMod = state.modifiers.reduce((m, mod) => m * (mod.sales ?? 1), 1) * (state.fandom.reviewBombWeeks > 0 ? FAN_REVIEW_BOMB_SALES : 1)
  const releases = state.releases.map((r) => {
    if (r.onSaleWeeks >= r.weeklySales.length) return r
    const units = Math.round((r.weeklySales[r.onSaleWeeks] ?? 0) * salesMod)
    const revenue = units * r.unitRevenue
    income += revenue
    return { ...r, onSaleWeeks: r.onSaleWeeks + 1, soldWeeks: [...r.soldWeeks, units], totalSales: r.totalSales + units, revenue: r.revenue + revenue }
  })
  return { ...state, releases, money: state.money + Math.round(income) }
}

export function weeklyIncome(state: GameState): number {
  return state.releases.reduce((sum, r) => sum + (r.onSaleWeeks < r.weeklySales.length ? (r.weeklySales[r.onSaleWeeks] ?? 0) * r.unitRevenue : 0), 0)
}

export function initialRivals(rng: Rng): Rival[] {
  return RIVAL_SEEDS.map((seed) => ({
    ...seed,
    genres: [...seed.genres],
    nextReleaseWeek: (seed.openYear - 1980) * 52 + rng.int(4, seed.pace),
    fans: seed.openYear === 1980 ? rng.int(200, 800) : 0,
    weakYears: 0,
    alive: true,
  }))
}

function rivalTitle(rng: Rng): string {
  return `${rng.pick(RIVAL_TITLE_PARTS.first)} ${rng.pick(RIVAL_TITLE_PARTS.second)}${rng.chance(0.25) ? ` ${rng.int(2, 4)}` : ''}`
}

export function weeklyRivals(state: GameState, rng: Rng): GameState {
  let next = state
  const year = yearOf(state.week)
  const rivals: Rival[] = []
  const releases: RivalRelease[] = []
  for (const r of state.rivals) {
    if (!r.alive || r.openYear > year) {
      rivals.push(r)
      continue
    }
    if (r.openYear === year && state.week === (year - 1980) * 52 + 1 && year > 1980) {
      next = log(next, `New rival: ${r.name} opens its doors. They make ${r.genres.join(' and ')} games.`, 'rival')
    }
    if (state.week < r.nextReleaseWeek) {
      rivals.push(r)
      continue
    }
    const open = r.genres.filter((g) => GENRES[g].year <= year)
    const genre = open.length > 0 ? rng.pick(open) : rng.pick(['arcade', 'puzzle', 'platformer'] as Genre[])
    const score = round1(clamp(r.quality + (rng.next() - 0.5) * 3, 1, 10))
    const release: RivalRelease = { rivalId: r.id, title: rivalTitle(rng), genre, week: state.week, score }
    releases.push(release)
    next = log(next, `${r.name} releases "${release.title}" (${GENRES[genre].label}). Critics: ${score}/10.`, 'rival')
    rivals.push({ ...r, nextReleaseWeek: state.week + r.pace + rng.int(-4, 4), fans: r.fans + Math.round(score * score * 20) })
  }
  return { ...next, rivals, rivalReleases: [...next.rivalReleases, ...releases].slice(-80) }
}

export function yearlyRivals(state: GameState, rng: Rng): GameState {
  const lastYear = yearOf(state.week) - 1
  let next = state
  const rivals = state.rivals.map((r) => {
    if (!r.alive || r.openYear > lastYear) return r
    const games = state.rivalReleases.filter((g) => g.rivalId === r.id && yearOf(g.week) === lastYear)
    const avg = games.length ? games.reduce((s, g) => s + g.score, 0) / games.length : 0
    const weakYears = avg < 5 ? r.weakYears + 1 : 0
    if (weakYears >= 3) {
      next = log(next, `${r.name} closes its doors after three bad years. The press writes a sad little column.`, 'rival')
      return { ...r, weakYears, alive: false }
    }
    return { ...r, weakYears, quality: Math.min(9.5, r.quality + 0.1) }
  })
  next = { ...next, rivals }
  const year = yearOf(state.week)
  if ((year - 1980) % 3 === 0 && year > 1980) {
    const name = `${rng.pick(RIVAL_NAME_PARTS.first)} ${rng.pick(RIVAL_NAME_PARTS.second)} ${rng.pick(RIVAL_NAME_PARTS.third)}`
    const open = (Object.keys(GENRES) as Genre[]).filter((g) => GENRES[g].year <= year)
    const rival: Rival = {
      id: `rival-${state.nextId}`,
      name,
      genres: [rng.pick(open), rng.pick(open)],
      quality: 4.5 + rng.next() * 2,
      pace: rng.int(16, 28),
      openYear: year,
      nextReleaseWeek: state.week + rng.int(8, 20),
      fans: 0,
      weakYears: 0,
      alive: true,
    }
    next = log({ ...next, nextId: next.nextId + 1, rivals: [...next.rivals, rival] }, `New rival: ${name} starts in somebody's basement.`, 'rival')
  }
  return next
}

type Entry = { title: string; studio: string; score: number; genre: Genre; player: boolean }

const CATEGORIES: { name: string; match: (g: Genre) => boolean }[] = [
  { name: 'Game of the Year', match: () => true },
  { name: 'Best Action Game', match: (g) => GENRES[g].tags.includes('action') },
  { name: 'Best Brain Game', match: (g) => GENRES[g].tags.includes('brains') || GENRES[g].tags.includes('story') },
]

function yearEntries(state: GameState): Entry[] {
  const year = yearOf(state.week)
  const rivalName = (id: string) => state.rivals.find((r) => r.id === id)?.name ?? 'Unknown'
  return [
    ...state.releases.filter((r) => yearOf(r.week) === year).map((r) => ({ title: r.title, studio: state.studioName, score: r.score, genre: r.genre, player: true })),
    ...state.rivalReleases.filter((r) => yearOf(r.week) === year).map((r) => ({ title: r.title, studio: rivalName(r.rivalId), score: r.score, genre: r.genre, player: false })),
  ]
}

export function nominations(state: GameState): GameState {
  const entries = yearEntries(state)
  const nominated = CATEGORIES.filter((c) => {
    const top = entries.filter((e) => c.match(e.genre)).sort((a, b) => b.score - a.score).slice(0, 3)
    return top.some((e) => e.player)
  })
  if (nominated.length === 0) return log(state, `Golden Cartridge nominations are out. ${state.studioName} is not on the list. Maybe next year.`)
  const next = { ...state, hype: Math.min(100, state.hype + NOMINATION_HYPE) }
  return log(next, `Golden Cartridge nominations! ${state.studioName} is up for ${nominated.map((c) => c.name).join(', ')}. Hype +${NOMINATION_HYPE}.`, 'good')
}

export function awardsShow(state: GameState): GameState {
  const entries = yearEntries(state)
  const year = yearOf(state.week)
  let next = state
  const awards: Award[] = []
  for (const c of CATEGORIES) {
    const winner = entries.filter((e) => c.match(e.genre)).sort((a, b) => b.score - a.score)[0]
    if (!winner) continue
    awards.push({ year, category: c.name, winner: winner.studio, title: winner.title, player: winner.player })
    if (winner.player) {
      next = { ...next, hype: Math.min(100, next.hype + AWARD_HYPE), fans: Math.round(next.fans * (1 + AWARD_FANS)) }
      next = shiftMorale(next, 5)
      next = log(next, `🏆 ${state.studioName} wins ${c.name} ${year} for "${winner.title}"! The garage door gets a new sticker.`, 'good')
    } else {
      next = log(next, `${c.name} ${year}: "${winner.title}" by ${winner.studio}.`, 'rival')
    }
  }
  return { ...next, awards: [...next.awards, ...awards] }
}
