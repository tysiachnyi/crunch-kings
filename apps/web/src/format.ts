export { money } from '@crunch-kings/game-core'

export function count(value: number): string {
  return Math.round(value).toLocaleString('en-US')
}

export function score(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}
