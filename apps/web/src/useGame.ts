import { useCallback, useEffect, useRef, useState } from 'react'
import { advanceWeek, createNewGame, isNewMonth, resolveEvent } from '@crunch-kings/game-core'
import type { GameState, NewGameSetup } from '@crunch-kings/game-core'
import { play } from './sound'

const SAVE_KEY = 'crunch-kings/save-v3'
const WEEK_MS = 1500
export const SPEEDS = [1, 2, 4] as const
export type Speed = (typeof SPEEDS)[number]

function loadSave(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as GameState
    return parsed.version === 3 ? parsed : null
  } catch {
    return null
  }
}

function writeSave(state: GameState | null) {
  try {
    if (state) localStorage.setItem(SAVE_KEY, JSON.stringify(state))
    else localStorage.removeItem(SAVE_KEY)
  } catch {
    return
  }
}

export function hasSave(): boolean {
  return loadSave() !== null
}

export function useGame() {
  const [game, setGame] = useState<GameState | null>(loadSave)
  const [running, setRunningState] = useState(false)
  const [speed, setSpeed] = useState<Speed>(1)
  const [releaseView, setReleaseView] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const previous = useRef<GameState | null>(game)

  useEffect(() => writeSave(game), [game])

  useEffect(() => {
    const before = previous.current
    previous.current = game
    if (!game || !before || before.week === game.week) return
    if (game.lastReleaseId && game.lastReleaseId !== before.lastReleaseId) {
      setRunningState(false)
      setReleaseView(game.lastReleaseId)
      play('fanfare')
      return
    }
    if (game.ending) {
      setRunningState(false)
      return
    }
    if (game.pendingEvents.length > 0 && before.pendingEvents.length === 0) {
      setRunningState(false)
      play('ding')
      return
    }
    if (isNewMonth(game.week)) play('payday')
  }, [game])

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => setGame((state) => (state ? advanceWeek(state) : state)), WEEK_MS / speed)
    return () => clearInterval(timer)
  }, [running, speed])

  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => setError(null), 3500)
    return () => clearTimeout(timer)
  }, [error])

  const act = useCallback((change: (state: GameState) => GameState, sound: Parameters<typeof play>[0] = 'click') => {
    const state = previous.current
    if (!state) return
    try {
      const next = change(state)
      previous.current = next
      setGame(next)
      play(sound)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      play('bad')
    }
  }, [])

  const setRunning = useCallback(
    (value: boolean) => {
      if (value && (!game || game.ending || game.pendingEvents.length > 0 || releaseView)) return
      setRunningState(value)
    },
    [game, releaseView],
  )

  const foundStudio = useCallback((setup: Omit<NewGameSetup, 'seed'>) => {
    const seed = Date.now() % 1_000_000
    const next = createNewGame({ ...setup, seed })
    previous.current = next
    setGame(next)
    setReleaseView(null)
    setRunningState(false)
  }, [])

  const choose = useCallback((choiceId: string) => {
    setGame((state) => (state ? resolveEvent(state, choiceId) : state))
    play('click')
  }, [])

  const quit = useCallback(() => {
    setRunningState(false)
    setReleaseView(null)
    setGame(null)
  }, [])

  return { game, running, setRunning, speed, setSpeed, foundStudio, act, choose, quit, releaseView, setReleaseView, error, setError }
}
