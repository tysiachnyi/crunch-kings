export { money } from '@crunch-kings/game-core'

export function count(value: number): string {
  return Math.round(value).toLocaleString('en-US')
}
