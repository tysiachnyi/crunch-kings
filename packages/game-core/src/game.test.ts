import { describe, expect, it } from 'vitest'
import { START_MONEY, advanceWeek, createNewGame, demoEndWeek, isNewMonth, monthlyCosts, resolveEvent, startProject, SIZES } from './index'
import type { Archetype, NewGameSetup } from './index'
import { autoplay, plan, runWeeks } from './testkit'

const SETUP: NewGameSetup = { studioName: 'Test Studio', founderName: 'Alex', archetype: 'coder', seed: 7 }

describe('new game', () => {
  it('starts in the garage with the founder, one friend, $20,000 and the starter tools', () => {
    const game = createNewGame(SETUP)
    expect(game.money).toBe(START_MONEY)
    expect(START_MONEY).toBe(20_000)
    expect(game.office).toBe('garage')
    expect(game.staff.map((e) => e.kind)).toEqual(['founder', 'friend'])
    expect(game.platforms).toEqual(['vector64'])
    expect(game.engines).toEqual(['tinker'])
    expect(game.candidates.length).toBeGreaterThan(0)
  })

  it.each<[Archetype, string, string]>([
    ['coder', 'Maggie Lee', 'artist'],
    ['artist', 'Danny Cobb', 'coder'],
    ['designer', 'Roy Pak', 'sound'],
  ])('gives a %s founder the garage friend %s (%s)', (archetype, friendName, friendRole) => {
    const friend = createNewGame({ ...SETUP, archetype }).staff[1]!
    expect(friend.name).toBe(friendName)
    expect(friend.role).toBe(friendRole)
  })

  it('gives every person six skills', () => {
    const founder = createNewGame(SETUP).staff[0]!
    expect(Object.keys(founder.skills).sort()).toEqual(['art', 'design', 'polish', 'sound', 'story', 'tech'])
  })

  it('names the founder "You" when the name is blank', () => {
    expect(createNewGame({ ...SETUP, founderName: '  ' }).staff[0]!.name).toBe('You')
  })
})

describe('game loop', () => {
  it('pays salaries and rent when a new month starts', () => {
    let game = createNewGame(SETUP)
    while (!isNewMonth(game.week + 1)) game = advanceWeek(game)
    const before = game.money
    const costs = monthlyCosts(game)
    game = advanceWeek(game)
    expect(before - game.money).toBe(costs)
  })

  it('ships a small game after its weeks, with six reviews', () => {
    let game = startProject(createNewGame(SETUP), plan({ title: 'Space Blaster' }))
    game = runWeeks(game, SIZES.S.weeks + 2)
    expect(game.project).toBeNull()
    expect(game.releases).toHaveLength(1)
    expect(game.releases[0]!.reviews).toHaveLength(6)
    expect(game.lastReleaseId).toBe(game.releases[0]!.id)
  })

  it('refuses a second project, a locked genre and a platform without a license', () => {
    const game = createNewGame(SETUP)
    const busy = startProject(game, plan())
    expect(() => startProject(busy, plan())).toThrow()
    expect(() => startProject(game, plan({ genre: 'racing' }))).toThrow(/not invented/)
    expect(() => startProject(game, plan({ platform: 'funbox' }))).toThrow(/license/)
    expect(() => startProject(game, plan({ size: 'M' }))).toThrow(/Research/)
  })

  it('is deterministic for the same seed', () => {
    const a = runWeeks(startProject(createNewGame(SETUP), plan()), 30)
    const b = runWeeks(startProject(createNewGame({ ...SETUP, studioName: 'Other' }), plan()), 30)
    expect(a.releases[0]!.score).toBe(b.releases[0]!.score)
    expect(a.money).toBe(b.money)
  })

  it('stops time while an event waits for a choice', () => {
    const game = { ...createNewGame(SETUP), pendingEvents: [{ id: 'coffee', title: 'T', text: 'X', choices: [{ id: 'ok', label: 'OK' }] }] }
    expect(advanceWeek(game).week).toBe(game.week)
    expect(advanceWeek(resolveEvent(game, 'ok')).week).toBe(game.week + 1)
  })

  it('ends the demo in January 1990', () => {
    const game = advanceWeek({ ...createNewGame(SETUP), week: demoEndWeek() - 1 })
    expect(game.ending).toBe('demoComplete')
  })
})

describe('balance', () => {
  it('lets a sensible studio reach 1990 and grow', () => {
    const game = autoplay(createNewGame(SETUP), 520)
    expect(game.ending).toBe('demoComplete')
    expect(game.money).toBeGreaterThan(START_MONEY)
    expect(game.office).toBe('smallOffice')
    expect(Math.max(...game.releases.map((r) => r.score))).toBeGreaterThanOrEqual(8)
  })

  it('gives a first garage game a middling score', () => {
    const game = runWeeks(startProject(createNewGame(SETUP), plan({ genre: 'platformer', topic: 'space' })), SIZES.S.weeks + 4)
    expect(game.releases[0]!.score).toBeGreaterThan(3)
    expect(game.releases[0]!.score).toBeLessThan(7.5)
  })

  it('punishes a studio that never upgrades its engine', () => {
    const game = autoplay(createNewGame(SETUP), 520, false)
    const late = game.releases.filter((r) => r.week > 52 * 7)
    expect(Math.max(...late.map((r) => r.score))).toBeLessThan(4)
  })
})
