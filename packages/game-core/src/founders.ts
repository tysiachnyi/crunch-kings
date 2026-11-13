import { FOUNDER_SALARY, FRIEND_SALARY, MORALE_START } from './balance'
import type { Archetype, Employee, Role, Skills, Trait } from './types'

const FOUNDER_SKILLS: Record<Archetype, Skills> = {
  coder: { design: 4, tech: 10, art: 4, sound: 3, story: 4, polish: 7 },
  designer: { design: 10, tech: 5, art: 4, sound: 3, story: 6, polish: 4 },
  artist: { design: 5, tech: 5, art: 10, sound: 5, story: 4, polish: 3 },
}

type FriendTemplate = { name: string; role: Role; skills: Skills; traits: Trait[] }

const GARAGE_FRIENDS: Record<Archetype, FriendTemplate> = {
  coder: { name: 'Maggie Lee', role: 'artist', skills: { design: 5, tech: 3, art: 9, sound: 3, story: 5, polish: 4 }, traits: ['loyal', 'perfectionist'] },
  artist: { name: 'Danny Cobb', role: 'coder', skills: { design: 3, tech: 9, art: 3, sound: 4, story: 2, polish: 6 }, traits: ['loyal', 'nightOwl'] },
  designer: { name: 'Roy Pak', role: 'sound', skills: { design: 4, tech: 4, art: 3, sound: 9, story: 4, polish: 5 }, traits: ['loyal', 'teamPlayer'] },
}

function person(base: Omit<Employee, 'morale' | 'stress' | 'burnoutWeeks' | 'lowMoraleWeeks' | 'hiredWeek'>): Employee {
  return { ...base, morale: MORALE_START, stress: 0, burnoutWeeks: 0, lowMoraleWeeks: 0, hiredWeek: 1 }
}

export function createFounder(name: string, archetype: Archetype): Employee {
  return person({
    id: 'founder',
    name: name.trim() || 'You',
    role: archetype,
    kind: 'founder',
    skills: { ...FOUNDER_SKILLS[archetype] },
    salary: FOUNDER_SALARY,
    traits: ['loyal'],
  })
}

export function createGarageFriend(archetype: Archetype): Employee {
  const friend = GARAGE_FRIENDS[archetype]
  return person({ id: 'friend', name: friend.name, role: friend.role, kind: 'friend', skills: { ...friend.skills }, salary: FRIEND_SALARY, traits: [...friend.traits] })
}
