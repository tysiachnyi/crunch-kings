import { useCallback, useEffect, useRef, useState } from 'react'
import { advanceWeek, createNewGame, DAYS_PER_WEEK, isNewMonth, resolveEvent, setPhaseFocus } from '@crunch-kings/game-core'
import type { GameState, NewGameSetup, PhaseWeights } from '@crunch-kings/game-core'
import { play } from './sound'

const SAVE_KEY = 'crunch-kings/save-v6'
const WEEK_MS = 1500
export const dayMs = (speed: number) => WEEK_MS / speed / DAYS_PER_WEEK
export const SPEEDS = [1, 2, 4] as const
export type Speed = (typeof SPEEDS)[number]

function loadSave(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as GameState
    return parsed.version === 6 ? parsed : null
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
  const runningRef = useRef(false)
  const resumeAfterPhase = useRef(false)
  const [reveal, setReveal] = useState({ week: game?.week ?? 0, days: DAYS_PER_WEEK })
  runningRef.current = running

  useEffect(() => writeSave(game), [game])

  useEffect(() => {
    const before = previous.current
    previous.current = game
    if (game?.project?.awaitingPhase && !before?.project?.awaitingPhase) {
      resumeAfterPhase.current = runningRef.current
      setRunningState(false)
      if (before && before.week !== game.week) play('ding')
    }
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

  const week = game?.week
  useEffect(() => {
    if (!running || week === undefined) return
    const timer = setInterval(
      () =>
        setReveal((r) => {
          const days = r.week === week ? r.days : 1
          return days >= DAYS_PER_WEEK && r.week === week ? r : { week, days: Math.min(DAYS_PER_WEEK, days + 1) }
        }),
      dayMs(speed),
    )
    return () => clearInterval(timer)
  }, [running, speed, week])

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
      if (value && (!game || game.ending || game.pendingEvents.length > 0 || game.project?.awaitingPhase || releaseView)) return
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

  const decidePhase = useCallback(
    (weights: PhaseWeights) => {
      act((state) => setPhaseFocus(state, weights))
      if (resumeAfterPhase.current) setRunningState(true)
      resumeAfterPhase.current = false
    },
    [act],
  )

  const choose = useCallback((choiceId: string) => {
    setGame((state) => (state ? resolveEvent(state, choiceId) : state))
    play('click')
  }, [])

  const quit = useCallback(() => {
    setRunningState(false)
    setReleaseView(null)
    setGame(null)
  }, [])

  const salesDays = game && reveal.week === game.week ? reveal.days : 1

  return { game, running, salesDays, setRunning, speed, setSpeed, foundStudio, act, decidePhase, choose, quit, releaseView, setReleaseView, error, setError }
}
