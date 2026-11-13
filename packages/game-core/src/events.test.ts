import { describe, expect, it } from 'vitest'
import { RESCUE_LOAN, advanceWeek, createNewGame, resolveEvent } from './index'
import type { GameState } from './types'
import { runWeeks } from './testkit'

const base = () => createNewGame({ studioName: 'Story', founderName: 'Ed', archetype: 'artist', seed: 13 })

describe('rescue ladder', () => {
  it('sends Mr Hawk with a loan after weeks in the red, then a publisher, then the end', () => {
    let game: GameState = { ...base(), money: -5000 }
    for (let i = 0; i < 6 && game.pendingEvents.length === 0; i++) game = advanceWeek(game)
    expect(game.pendingEvents[0]?.id).toBe('hawkLoan')
    const money = game.money
    game = resolveEvent(game, 'accept')
    expect(game.money).toBe(money + RESCUE_LOAN)
    expect(game.loan).not.toBeNull()

    game = { ...game, money: -50000, pendingEvents: [] }
    for (let i = 0; i < 12 && !game.pendingEvents.some((e) => e.id === 'absorbed'); i++) game = advanceWeek({ ...game, pendingEvents: [] })
    expect(game.rescueStep).toBe(2)

    game = { ...game, money: -50000, pendingEvents: [] }
    for (let i = 0; i < 12 && !game.ending; i++) game = advanceWeek({ ...game, pendingEvents: [], money: Math.min(game.money, -50000) })
    expect(game.ending).toBe('bankrupt')
  })
})

describe('story beats', () => {
  it('crashes the market in 1983', () => {
    const game = runWeeks({ ...base(), week: 52 * 3 + 5 }, 6)
    expect(game.modifiers.some((m) => m.id === 'crash')).toBe(true)
  })

  it('opens chapter 2 in January 1985', () => {
    const game = advanceWeek({ ...base(), week: 52 * 5 })
    expect(game.pendingEvents.some((e) => e.id === 'chapter2')).toBe(true)
  })

  it('holds a game jam every spring', () => {
    const game = advanceWeek({ ...base(), week: 52 + 19 })
    expect(game.pendingEvents.some((e) => e.id === 'jam')).toBe(true)
  })
})
