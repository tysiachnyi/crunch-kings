import type { GameSize, OfficeLevel } from './types'

export const START_YEAR = 1980
export const DEMO_END_YEAR = 1989
export const WEEKS_PER_YEAR = 52

export const START_MONEY = 20_000
export const FOUNDER_SALARY = 800
export const FRIEND_SALARY = 1000
export const SALARY_PER_SKILL_POINT = 400
export const INFLATION_PER_YEAR = 0.03

export const OFFICES: Record<OfficeLevel, { label: string; capacity: number; rent: number; moveCost: number }> = {
  garage: { label: 'Garage', capacity: 2, rent: 200, moveCost: 0 },
  smallOffice: { label: 'Small office', capacity: 6, rent: 1500, moveCost: 6000 },
}

export const SIZES: Record<GameSize, { weeks: number; salesMult: number; qualityBonus: number; minStaff: number; price: number; label: string }> = {
  S: { weeks: 8, salesMult: 1, qualityBonus: 0, minStaff: 1, price: 12, label: 'Small' },
  M: { weeks: 14, salesMult: 1.5, qualityBonus: 4, minStaff: 3, price: 18, label: 'Medium' },
  L: { weeks: 22, salesMult: 1.9, qualityBonus: 8, minStaff: 5, price: 25, label: 'Large' },
}

export const WORK_RATE = 1
export const PHASE_WEIGHT_STEP = 5
export const PHASE_WEIGHT_MAX = 100
export const QUALITY_BAR_BASE = 10
export const QUALITY_BAR_GROWTH = 0.2
export const QUALITY_CURVE = 0.6
export const COMBO_GREAT = 8
export const COMBO_GOOD = 3
export const COMBO_BAD = -8
export const GENRE_FATIGUE_PENALTY = 3
export const BUG_RATE = 0.06
export const BUG_PENALTY_MAX = 30
export const TEST_WEEK_BUG_REMOVAL = 0.5
export const TEST_LAB_BUG_REMOVAL = 0.75
export const ENGINE_AGE_PENALTY = 1.1

export const CRUNCH_OUTPUT = 1.25
export const CRUNCH_BUGS = 1.5
export const CRUNCH_STRESS = 10
export const REST_STRESS = -5
export const BURNOUT_STRESS = 80
export const BURNOUT_WEEKS = 8

export const MORALE_START = 70
export const MORALE_HIT = 5
export const MORALE_FLOP = -8
export const MORALE_CRUNCH = -2
export const MORALE_REST = 3
export const MORALE_TEAM_PLAYER = 2
export const MORALE_QUIT_LINE = 25
export const MORALE_QUIT_WEEKS = 4
export const HIT_SCORE = 8
export const FLOP_SCORE = 5

export const CANDIDATES_PER_MONTH = 3
export const CANDIDATES_WITH_RECRUITER = 5
export const FIRE_COST_MONTHS = 2
export const TRAINING_COST = 1500
export const TRAINING_GAIN = 1
export const FAST_LEARNER_BONUS = 1.5
export const SKILL_GAIN_PER_RELEASE = 0.3
export const SKILL_CAP = 20

export const UNIT_SCALE = 20
export const SALES_RATE = 0.0024
export const SALES_SCORE_POWER = 2
export const SALES_AUDIENCE_CAP = 0.15
export const SALES_TAIL_WEEKS = 32
export const SALES_DECAY = 0.12
export const FAN_SALES_DIVISOR = 400
export const FAN_SALES_MAX_BONUS = 0.5
export const FANS_PER_COPY = 0.15
export const RIVAL_CLASH_WEEKS = 2
export const RIVAL_CLASH_SALES = 0.85
export const RIVAL_CLASH_SAME_GENRE = 0.75

export const SMALL_CAMPAIGN = { cost: 1500, hype: 10 }
export const BIG_CAMPAIGN = { cost: 6000, hype: 25 }
export const PRESS_KIT_HYPE = 8
export const HYPE_DECAY = 1
export const DEV_DIARY_MOOD = 6
export const DEV_DIARY_HYPE = 3

export const RP_PER_SCORE = 2
export const RP_IDLE_PER_STAFF = 0.5
export const RP_WORK_PER_STAFF = 0.15

export const FAN_MOOD_START = 60
export const FAN_MOOD_REST = 60
export const FAN_RELEASE_FACTOR = 6
export const FAN_RELEASE_MIN = -25
export const FAN_RELEASE_MAX = 20
export const FAN_SEQUEL_FULFIL = 12
export const FAN_DEMAND_PATIENCE = 26
export const FAN_EXPECTATION_DEFAULT = 5
export const FAN_REVIEW_BOMB_MOOD = 25
export const FAN_REVIEW_BOMB_SCORE = 2
export const FAN_REVIEW_BOMB_WEEKS = 4
export const FAN_REVIEW_BOMB_SALES = 0.9
export const FAN_PETITION_FULFIL = 10
export const FAN_PETITION_FULFIL_COST = 1500
export const FAN_PETITION_IGNORE = -5
export const FAN_FORGIVE = 20
export const FAN_FORGIVE_BELOW = 40
export const FAN_ANGRY_DROP = 10

export const EVENTS_PER_YEAR = 4

export const CONTRACT_OFFERS = 3
export const CONTRACT_PAY_PER_POINT = 90

export const RESCUE_NEGATIVE_WEEKS = 4
export const RESCUE_LOAN = 15_000
export const RESCUE_LOAN_WEEKS = 50
export const RESCUE_LOAN_INTEREST = 0.2
export const ABSORB_STAFF_LOSS = 0.4
export const ABSORB_MONEY = 5000

export const AWARD_HYPE = 15
export const AWARD_FANS = 0.1
export const NOMINATION_HYPE = 8
export const JAM_HYPE = 10
export const JAM_FANS = 150

export const WEEKDAY_SHAPE = [0.8, 0.85, 0.9, 0.95, 1.1, 1.4, 1.5]
export const DAY_JITTER = 0.12
export const DAYS_PER_WEEK = 7
export const SALES_DAY_DECAY = (1 - SALES_DECAY) ** (1 / DAYS_PER_WEEK)

export const BADGE_HYPE = 1
export const UNIT_TIER_UNITS = [800, 2000, 4500, 7000].map((u) => u * UNIT_SCALE)
export const LONG_SELLER_WEEKS = 16
export const LONG_SELLER_UNITS = 40 * UNIT_SCALE
export const YEAR_BEST_MIN_WEEK = 10
export const RIVAL_SIZE_MULT = 2.4
export const RIVAL_REACH_SHARE = 0.7
export const REGION_JITTER = 0.1
export const REGION_WIN_MARGIN = 1.5
