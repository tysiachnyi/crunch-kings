export type Role = 'coder' | 'artist' | 'producer'

export type Genre = 'action' | 'rpg' | 'puzzle' | 'sim'

export type Topic = 'space' | 'fantasy' | 'zombies' | 'office' | 'pirates'

export type Skills = {
  design: number
  tech: number
}

export type Employee = {
  id: string
  name: string
  role: Role
  skills: Skills
  salary: number
}

export type GameProject = {
  title: string
  genre: Genre
  topic: Topic
  weeksLeft: number
  design: number
  tech: number
  bugs: number
}

export type Release = {
  title: string
  week: number
  score: number
  sales: number
  fansGained: number
}

export type GameEvent = {
  week: number
  text: string
}

export type GameState = {
  studioName: string
  week: number
  money: number
  fans: number
  staff: Employee[]
  project: GameProject | null
  releases: Release[]
  log: GameEvent[]
  seed: number
}

export type ProjectPlan = {
  title: string
  genre: Genre
  topic: Topic
}
