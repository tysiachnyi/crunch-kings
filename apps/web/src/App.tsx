import { useState } from 'react'
import { OfficeCanvas } from '@crunchy/scene'
import { PROJECT_WEEKS } from '@crunchy/game-core'
import type { Genre, Topic } from '@crunchy/game-core'
import { useGame } from './useGame'

const GENRES: Genre[] = ['action', 'rpg', 'puzzle', 'sim']
const TOPICS: Topic[] = ['space', 'fantasy', 'zombies', 'office', 'pirates']

const money = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`

export function App() {
  const { game, running, setRunning, start, restart } = useGame()
  const [selected, setSelected] = useState<string | null>(null)
  const [title, setTitle] = useState('Untitled Hit')
  const [genre, setGenre] = useState<Genre>('action')
  const [topic, setTopic] = useState<Topic>('zombies')
  const lastRelease = game.releases.at(-1)

  return (
    <div className="game">
      <OfficeCanvas onSelect={setSelected} />

      <header className="hud">
        <strong>{game.studioName}</strong>
        <span>Week {game.week}</span>
        <span className={game.money < 0 ? 'bad' : undefined}>{money(game.money)}</span>
        <span>{game.fans.toLocaleString('en-US')} fans</span>
        <button onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Play'}</button>
        <button className="ghost" onClick={restart}>New studio</button>
      </header>

      <aside className="card side">
        {game.project ? (
          <>
            <h2>{game.project.title}</h2>
            <p>{game.project.topic} · {game.project.genre}</p>
            <progress max={PROJECT_WEEKS} value={PROJECT_WEEKS - game.project.weeksLeft} />
            <p>Design {Math.round(game.project.design)} · Tech {Math.round(game.project.tech)} · Bugs {game.project.bugs}</p>
          </>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              start({ title: title.trim() || 'Untitled Hit', genre, topic })
            }}
          >
            <h2>New game</h2>
            <label>
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={40} />
            </label>
            <label>
              Topic
              <select value={topic} onChange={(e) => setTopic(e.target.value as Topic)}>
                {TOPICS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label>
              Genre
              <select value={genre} onChange={(e) => setGenre(e.target.value as Genre)}>
                {GENRES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </label>
            <button type="submit">Start development</button>
          </form>
        )}
        {lastRelease && (
          <div className="review">
            Last release: <strong>{lastRelease.title}</strong> - {lastRelease.score}/10
          </div>
        )}
      </aside>

      <section className="card log">
        {game.log.slice(-4).reverse().map((entry, i) => (
          <p key={`${entry.week}-${i}`}><b>W{entry.week}</b> {entry.text}</p>
        ))}
      </section>

      {selected && <div className="card selected">Selected: {selected}</div>}
    </div>
  )
}
