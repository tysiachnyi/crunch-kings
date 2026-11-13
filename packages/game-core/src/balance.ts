import type { Genre, Topic } from './types'

export const START_MONEY = 70_000
export const PROJECT_WEEKS = 12
export const PAYDAY_EVERY_WEEKS = 4
export const PRICE_PER_COPY = 12
export const QUALITY_CAP = 400

const GREAT = 1.2
const GOOD = 1
const MEH = 0.8
const AWFUL = 0.6

export const COMBO: Record<Topic, Record<Genre, number>> = {
  space: { action: GREAT, rpg: GOOD, puzzle: MEH, sim: GOOD },
  fantasy: { action: GOOD, rpg: GREAT, puzzle: MEH, sim: AWFUL },
  zombies: { action: GREAT, rpg: MEH, puzzle: AWFUL, sim: MEH },
  office: { action: AWFUL, rpg: MEH, puzzle: GOOD, sim: GREAT },
  pirates: { action: GOOD, rpg: GOOD, puzzle: MEH, sim: MEH },
}

export const DESIGN_WEIGHT: Record<Genre, number> = {
  action: 0.4,
  rpg: 0.7,
  puzzle: 0.6,
  sim: 0.5,
}
