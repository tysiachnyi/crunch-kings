import { describe, expect, it } from 'vitest'
import { BURNOUT_WEEKS, createNewGame, fire, hire, setCrunch, startProject, train } from './index'
import { weeklyStaff } from './staff'
import type { GameState } from './types'
import { plan } from './testkit'

const base = () => createNewGame({ studioName: 'Staff', founderName: 'Cy', archetype: 'coder', seed: 5 })

describe('staff', () => {
  it('cannot hire into a full garage, but can in a small office', () => {
    const game = base()
    const id = game.candidates[0]!.id
    expect(() => hire(game, id)).toThrow(/full/)
    const office: GameState = { ...game, office: 'smallOffice' }
    const after = hire(office, id)
    expect(after.staff).toHaveLength(3)
    expect(after.money).toBe(office.money - office.candidates[0]!.salary)
  })

  it('charges two months of salary to fire someone and never fires the founder', () => {
    const game = base()
    const friend = game.staff[1]!
    expect(fire(game, friend.id).money).toBe(game.money - friend.salary * 2)
    expect(() => fire(game, 'founder')).toThrow()
  })

  it('burns people out after long crunch', () => {
    let game = setCrunch(startProject(base(), plan()), true)
    for (let i = 0; i < 9; i++) game = weeklyStaff(game, true, true)
    expect(game.staff.some((e) => e.burnoutWeeks > 0 && e.burnoutWeeks <= BURNOUT_WEEKS)).toBe(true)
  })

  it('lets an unhappy hire quit after four weeks of low morale', () => {
    const office: GameState = { ...base(), office: 'smallOffice' }
    let game = hire(office, office.candidates[0]!.id)
    game = { ...game, staff: game.staff.map((e) => (e.kind === 'hire' ? { ...e, morale: 5, traits: [] } : e)) }
    for (let i = 0; i < 5; i++) game = weeklyStaff(game, true, true)
    expect(game.staff.filter((e) => e.kind === 'hire')).toHaveLength(0)
  })

  it('needs the training room to train', () => {
    const game = base()
    expect(() => train(game, 'founder', 'art')).toThrow()
    const trained = train({ ...game, research: ['trainingRoom'] }, 'founder', 'art')
    expect(trained.staff[0]!.skills.art).toBe(game.staff[0]!.skills.art + 1)
  })
})
