import { describe, expect, it } from 'vitest'
import { PROJECT_WEEKS, START_MONEY, advanceWeek, createNewGame, reviewScore, startProject } from './index'
import type { GameState } from './index'

function runWeeks(state: GameState, weeks: number): GameState {
  for (let i = 0; i < weeks; i++) state = advanceWeek(state)
  return state
}

describe('game loop', () => {
  it('starts with money, founders and no project', () => {
    const game = createNewGame('Crunchy Fellos')
    expect(game.money).toBe(START_MONEY)
    expect(game.staff).toHaveLength(3)
    expect(game.project).toBeNull()
  })

  it('pays salaries every fourth week', () => {
    const game = runWeeks(createNewGame('Test'), 3)
    expect(game.week).toBe(4)
    expect(game.money).toBe(START_MONEY - 9500)
  })

  it('ships a project after its development weeks and adds a release', () => {
    let game = startProject(createNewGame('Test'), { title: 'Zombie Tax Office', genre: 'action', topic: 'zombies' })
    game = runWeeks(game, PROJECT_WEEKS)
    expect(game.project).toBeNull()
    expect(game.releases).toHaveLength(1)
    expect(game.releases[0]!.score).toBeGreaterThanOrEqual(1)
    expect(game.fans).toBeGreaterThan(0)
  })

  it('refuses a second project while one is in progress', () => {
    const game = startProject(createNewGame('Test'), { title: 'A', genre: 'rpg', topic: 'fantasy' })
    expect(() => startProject(game, { title: 'B', genre: 'rpg', topic: 'fantasy' })).toThrow()
  })

  it('is deterministic for the same seed', () => {
    const plan = { title: 'Space Pals', genre: 'rpg', topic: 'space' } as const
    const a = runWeeks(startProject(createNewGame('A', 42), plan), PROJECT_WEEKS)
    const b = runWeeks(startProject(createNewGame('B', 42), plan), PROJECT_WEEKS)
    expect(a.releases[0]!.score).toBe(b.releases[0]!.score)
  })
})

describe('reviewScore', () => {
  it('rewards a good topic and genre combo', () => {
    const base = { title: 'X', weeksLeft: 0, design: 80, tech: 60, bugs: 0 }
    const great = reviewScore({ ...base, genre: 'rpg', topic: 'fantasy' })
    const awful = reviewScore({ ...base, genre: 'sim', topic: 'fantasy' })
    expect(great).toBeGreaterThan(awful)
  })
})
