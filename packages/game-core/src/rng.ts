export function nextRandom(seed: number): [value: number, nextSeed: number] {
  let t = (seed + 0x6d2b79f5) | 0
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296
  return [value, (seed + 0x6d2b79f5) | 0]
}

export type Rng = {
  seed: number
  next: () => number
  int: (min: number, max: number) => number
  chance: (p: number) => boolean
  pick: <T>(items: readonly T[]) => T
}

export function createRng(seed: number): Rng {
  const rng: Rng = {
    seed,
    next() {
      const [value, nextSeed] = nextRandom(rng.seed)
      rng.seed = nextSeed
      return value
    },
    int(min, max) {
      return min + Math.floor(rng.next() * (max - min + 1))
    },
    chance(p) {
      return rng.next() < p
    },
    pick(items) {
      const item = items[Math.floor(rng.next() * items.length)]
      if (item === undefined) throw new Error('Cannot pick from an empty list.')
      return item
    },
  }
  return rng
}

export function hashUnit(key: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 0x01000193)
  return nextRandom(h | 0)[0]
}
