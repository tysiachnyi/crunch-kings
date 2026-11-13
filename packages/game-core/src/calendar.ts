import { DEMO_END_YEAR, START_YEAR, WEEKS_PER_YEAR } from './balance'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function yearOf(week: number): number {
  return START_YEAR + Math.floor((week - 1) / WEEKS_PER_YEAR)
}

export function weekOfYear(week: number): number {
  return ((week - 1) % WEEKS_PER_YEAR) + 1
}

export function monthIndexOf(week: number): number {
  return Math.min(11, Math.floor(((weekOfYear(week) - 1) * 12) / WEEKS_PER_YEAR))
}

export function monthOf(week: number): string {
  return MONTHS[monthIndexOf(week)] ?? 'January'
}

export function dateLabel(week: number): string {
  return `${monthOf(week)} ${yearOf(week)}`
}

export function isNewMonth(week: number): boolean {
  return week === 1 || monthIndexOf(week) !== monthIndexOf(week - 1)
}

export function isNewYear(week: number): boolean {
  return weekOfYear(week) === 1
}

export function demoEndWeek(): number {
  return (DEMO_END_YEAR - START_YEAR + 1) * WEEKS_PER_YEAR + 1
}
