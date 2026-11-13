import { INFLATION_PER_YEAR } from './balance'
import { yearOf } from './calendar'
import type { GameState, LogEntry } from './types'

export function log(state: GameState, text: string, tone?: LogEntry['tone']): GameState {
  const entry: LogEntry = tone ? { week: state.week, text, tone } : { week: state.week, text }
  return { ...state, log: [...state.log, entry].slice(-200) }
}

export function money(value: number): string {
  const sign = value < 0 ? '-' : ''
  return `${sign}$${Math.abs(Math.round(value)).toLocaleString('en-US')}`
}

export function inflation(week: number): number {
  return (1 + INFLATION_PER_YEAR) ** (yearOf(week) - 1980)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function newId(state: GameState, prefix: string): [string, GameState] {
  return [`${prefix}-${state.nextId}`, { ...state, nextId: state.nextId + 1 }]
}

export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? key)
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10
}
