export type Skill = 'design' | 'tech' | 'art' | 'sound' | 'story' | 'polish'

export type Skills = Record<Skill, number>

export type Focus = Record<Skill, number>

export type Role = 'coder' | 'artist' | 'designer' | 'sound' | 'writer'

export type Archetype = 'coder' | 'designer' | 'artist'

export type EmployeeKind = 'founder' | 'friend' | 'hire'

export type Trait =
  | 'fastLearner'
  | 'workaholic'
  | 'perfectionist'
  | 'teamPlayer'
  | 'diva'
  | 'nightOwl'
  | 'cheap'
  | 'loyal'

export type Employee = {
  id: string
  name: string
  role: Role
  kind: EmployeeKind
  skills: Skills
  salary: number
  traits: Trait[]
  morale: number
  stress: number
  burnoutWeeks: number
  lowMoraleWeeks: number
  hiredWeek: number
}

export type Genre = 'arcade' | 'platformer' | 'puzzle' | 'sports' | 'racing' | 'shooter' | 'adventure' | 'rpg'

export type Topic =
  | 'fantasy'
  | 'space'
  | 'pirates'
  | 'ninjas'
  | 'robots'
  | 'zombies'
  | 'detectives'
  | 'dinosaurs'
  | 'cooking'
  | 'office'
  | 'aliens'
  | 'cowboys'

export type Tag = 'action' | 'brains' | 'social' | 'story' | 'world'

export type RegionId = 'usa' | 'germany' | 'japan' | 'uk' | 'france' | 'brazil'

export type SalesBadge = {
  id: string
  week: number
  label: string
}

export type GameSize = 'S' | 'M' | 'L'

export type PlatformId = 'vector64' | 'kestrel' | 'funbox'

export type EngineId = 'tinker' | 'pixelpal' | 'scrollmaster' | 'own'

export type ResearchId =
  | 'engineBasics'
  | 'engineTools'
  | 'trainingRoom'
  | 'recruiter'
  | 'teamSpirit'
  | 'marketing'
  | 'pressKit'
  | 'marketResearch'
  | 'testLab'
  | 'playtests'
  | 'soundStudio'
  | 'mediumGames'
  | 'largeGames'

export type OfficeLevel = 'garage' | 'smallOffice'

export type ProjectPlan = {
  title: string
  genre: Genre
  topic: Topic
  size: GameSize
  platform: PlatformId
  engine: EngineId
  sequelOf?: string
}

export type PhaseWeights = [number, number, number]

export type GameProject = ProjectPlan & {
  focus: Focus
  phase: number
  awaitingPhase: boolean
  phaseWeeksLeft: number
  phaseWeights: PhaseWeights[]
  phaseStart: Focus
  totalWeeks: number
  weeksLeft: number
  points: Focus
  bugs: number
  hype: number
  testing: boolean
  crunch: boolean
  startWeek: number
}

export type Review = {
  outlet: string
  score: number
  quote: string
}

export type Release = {
  id: string
  title: string
  genre: Genre
  topic: Topic
  size: GameSize
  platform: PlatformId
  week: number
  score: number
  reviews: Review[]
  weeklySales: number[]
  soldWeeks: number[]
  badges: SalesBadge[]
  totalSales: number
  hint: string | null
  chartRank: number
  revenue: number
  unitRevenue: number
  fansGained: number
  sequelOf?: string
  onSaleWeeks: number
}

export type RivalRelease = {
  rivalId: string
  title: string
  genre: Genre
  week: number
  score: number
}

export type Rival = {
  id: string
  name: string
  genres: Genre[]
  quality: number
  pace: number
  openYear: number
  nextReleaseWeek: number
  fans: number
  weakYears: number
  alive: boolean
}

export type FanDemand = {
  id: string
  kind: 'sequel' | 'petition'
  text: string
  target?: string
  openedWeek: number
  petitioned: boolean
}

export type Fandom = {
  mood: number
  demands: FanDemand[]
  reviewBombWeeks: number
  lastLetterWeek: number
}

export type Candidate = Omit<Employee, 'morale' | 'stress' | 'burnoutWeeks' | 'lowMoraleWeeks' | 'hiredWeek'>

export type Contract = {
  id: string
  client: string
  task: string
  skill: Skill
  required: number
  progress: number
  pay: number
  penalty: number
  weeksLeft: number
}

export type EventChoice = {
  id: string
  label: string
}

export type PendingEvent = {
  id: string
  title: string
  text: string
  choices: EventChoice[]
  data?: Record<string, string | number>
}

export type Modifier = {
  id: string
  label: string
  weeksLeft: number
  sales?: number
  quality?: number
  genre?: Genre
  topic?: Topic
  fanGrowth?: number
}

export type LogEntry = {
  week: number
  text: string
  tone?: 'good' | 'bad' | 'fan' | 'rival' | 'story'
}

export type Award = {
  year: number
  category: string
  winner: string
  title: string
  player: boolean
}

export type Ending = 'demoComplete' | 'bankrupt'

export type Loan = {
  amount: number
  weeklyPayment: number
  weeksLeft: number
}

export type GameState = {
  version: 6
  studioName: string
  founderArchetype: Archetype
  week: number
  money: number
  fans: number
  hype: number
  researchPoints: number
  research: ResearchId[]
  platforms: PlatformId[]
  engines: EngineId[]
  ownEngine: { level: number; year: number } | null
  office: OfficeLevel
  staff: Employee[]
  candidates: Candidate[]
  contracts: Contract[]
  activeContract: Contract | null
  project: GameProject | null
  releases: Release[]
  rivals: Rival[]
  rivalReleases: RivalRelease[]
  fandom: Fandom
  modifiers: Modifier[]
  pendingEvents: PendingEvent[]
  awards: Award[]
  milestones: string[]
  log: LogEntry[]
  loan: Loan | null
  negativeWeeks: number
  yearStartMoney: number
  rescueStep: number
  ending: Ending | null
  lastReleaseId: string | null
  firedEvents: Record<string, number>
  seed: number
  nextId: number
}

export type NewGameSetup = {
  studioName: string
  founderName: string
  archetype: Archetype
  seed?: number
}
