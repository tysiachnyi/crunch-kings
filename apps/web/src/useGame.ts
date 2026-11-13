import { useCallback, useEffect, useState } from 'react'
import { advanceWeek, createNewGame, startProject } from '@crunchy/game-core'
import type { GameState, ProjectPlan } from '@crunchy/game-core'

const SAVE_KEY = 'crunchy-fellos/save-v1'
const WEEK_MS = 1500

function loadSave(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    return raw ? (JSON.parse(raw) as GameState) : null
  } catch {
    return null
  }
}

function writeSave(state: GameState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state))
  } catch {
    return
  }
}

export function useGame() {
  const [game, setGame] = useState<GameState>(() => loadSave() ?? createNewGame('Crunchy Fellos', Date.now() % 100000))
  const [running, setRunning] = useState(false)

  useEffect(() => writeSave(game), [game])

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => setGame(advanceWeek), WEEK_MS)
    return () => clearInterval(timer)
  }, [running])

  const start = useCallback((plan: ProjectPlan) => {
    setGame((state) => startProject(state, plan))
    setRunning(true)
  }, [])

  const restart = useCallback(() => {
    setRunning(false)
    setGame(createNewGame('Crunchy Fellos', Date.now() % 100000))
  }, [])

  return { game, running, setRunning, start, restart }
}
