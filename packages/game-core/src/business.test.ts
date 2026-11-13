import { describe, expect, it } from 'vitest'
import { buyPlatform, buyResearch, canMove, createNewGame, moveOffice, takeContract } from './index'
import { generateContracts, workOnContract, yearEnd } from './business'
import { createRng } from './rng'
import type { GameState } from './types'
import { plan, runWeeks } from './testkit'
import { startProject } from './project'

const base = () => createNewGame({ studioName: 'Biz', founderName: 'Di', archetype: 'designer', seed: 9 })

describe('contracts', () => {
  it('opens contracts only after the first game', () => {
    expect(generateContracts(base(), createRng(1))).toHaveLength(0)
    const shipped = runWeeks(startProject(base(), plan()), 12)
    expect(generateContracts(shipped, createRng(1))).toHaveLength(3)
  })

  it('pays a contract when the team finishes the work', () => {
    const game: GameState = { ...base(), contracts: [{ id: 'c1', client: 'Bank', task: 'Coin', skill: 'design', required: 5, progress: 0, pay: 3000, penalty: 900, weeksLeft: 3 }] }
    const taken = takeContract(game, 'c1')
    const done = workOnContract(taken, createRng(1))
    expect(done.activeContract).toBeNull()
    expect(done.money).toBe(game.money + 3000)
  })

  it('charges a penalty when the deadline passes', () => {
    const game: GameState = { ...base(), activeContract: { id: 'c1', client: 'Bank', task: 'Coin', skill: 'sound', required: 9999, progress: 0, pay: 3000, penalty: 900, weeksLeft: 1 } }
    expect(workOnContract(game, createRng(1)).money).toBe(game.money - 900)
  })
})

describe('research, licenses and offices', () => {
  it('spends research points and money, and engine basics gives an own engine', () => {
    const game: GameState = { ...base(), researchPoints: 50 }
    const after = buyResearch(game, 'engineBasics')
    expect(after.researchPoints).toBe(30)
    expect(after.engines).toContain('own')
    expect(after.ownEngine?.level).toBe(1)
    expect(() => buyResearch({ ...base(), researchPoints: 0 }, 'engineBasics')).toThrow()
  })

  it('needs the parent node first', () => {
    expect(() => buyResearch({ ...base(), researchPoints: 99 }, 'engineTools')).toThrow()
  })

  it('sells a console license only after the console exists', () => {
    expect(() => buyPlatform(base(), 'funbox')).toThrow()
    const later = { ...base(), week: 52 * 5 + 1 }
    expect(buyPlatform(later, 'funbox').platforms).toContain('funbox')
  })

  it('opens the small office after the first profitable year', () => {
    const game = base()
    expect(canMove(game, 'smallOffice')).toBe(false)
    const shipped = runWeeks(startProject(game, plan()), 12)
    const rich = yearEnd({ ...shipped, money: shipped.yearStartMoney + 10000 })
    expect(canMove(rich, 'smallOffice')).toBe(true)
    expect(moveOffice(rich, 'smallOffice').office).toBe('smallOffice')
  })
})
