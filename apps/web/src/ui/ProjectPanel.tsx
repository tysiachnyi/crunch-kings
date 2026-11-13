import { useMemo, useState } from 'react'
import {
  ENGINES,
  GENRES,
  PLATFORMS,
  SIZES,
  SKILLS,
  TOPICS,
  availableSizes,
  comboLabel,
  engineTech,
  normalizeFocus,
  projectQuality,
  runCampaign,
  setCrunch,
  startProject,
  unlockedGenres,
  unlockedTopics,
  writeDevDiary,
  yearOf,
} from '@crunch-kings/game-core'
import type { EngineId, Focus, GameSize, GameState, Genre, PlatformId, Skill, Topic } from '@crunch-kings/game-core'
import { money } from '../format'

type Act = (change: (state: GameState) => GameState, sound?: 'click' | 'coin' | 'research' | 'hire') => void

const SKILL_LABEL: Record<Skill, string> = { design: 'Design', tech: 'Tech', art: 'Art', sound: 'Sound', story: 'Story', polish: 'Polish' }

export function ProjectPanel({ game, act }: { game: GameState; act: Act }) {
  if (game.project) return <ProjectProgress game={game} act={act} />
  if (game.activeContract) {
    const c = game.activeContract
    return (
      <div className="panel-body">
        <h2>Contract: {c.client}</h2>
        <p className="muted">{c.task}</p>
        <Meter label={`${SKILL_LABEL[c.skill]} work`} value={c.progress} max={c.required} />
        <p>
          Pays <b>{money(c.pay)}</b> · {c.weeksLeft} weeks left · penalty {money(c.penalty)}
        </p>
      </div>
    )
  }
  return <NewGameForm game={game} act={act} />
}

function Meter({ label, value, max, tone }: { label: string; value: number; max: number; tone?: string }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100))
  return (
    <div className="meter">
      <div className="meter-label">
        <span>{label}</span>
        <span>{Math.round(value)}</span>
      </div>
      <div className="meter-track">
        <div className={`meter-fill ${tone ?? ''}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function ProjectProgress({ game, act }: { game: GameState; act: Act }) {
  const p = game.project!
  const done = p.totalWeeks - p.weeksLeft
  const maxPoints = Math.max(...SKILLS.map((s) => p.points[s]), 1)
  const predicted = game.research.includes('playtests') && done > 1 ? projectQuality(game, p, false).quality / 10 : null
  return (
    <div className="panel-body">
      <h2>{p.title}</h2>
      <p className="muted">
        {GENRES[p.genre].label} · {TOPICS[p.topic].label} · size {p.size} · {PLATFORMS[p.platform].label}
        {p.sequelOf ? ' · sequel' : ''}
      </p>
      <Meter label={p.weeksLeft <= 1 ? 'Testing week' : `Week ${done} of ${p.totalWeeks}`} value={done} max={p.totalWeeks} />
      <div className="points">
        {SKILLS.map((s) => (
          <Meter key={s} label={SKILL_LABEL[s]} value={p.points[s]} max={maxPoints} tone="soft" />
        ))}
      </div>
      <p>
        Bugs <b className={p.bugs > 10 ? 'bad' : undefined}>{Math.round(p.bugs)}</b> · Hype <b>{Math.round(p.hype + game.hype)}</b>
        {predicted !== null && (
          <>
            {' '}
            · Playtest guess <b>{predicted.toFixed(1)}</b>
          </>
        )}
      </p>
      <div className="row">
        <button className={p.crunch ? 'danger' : 'secondary'} onClick={() => act((s) => setCrunch(s, !p.crunch))} title="Output x1.25, more bugs, stress +10 a week">
          {p.crunch ? 'Stop crunch' : 'Crunch'}
        </button>
        <button className="secondary" onClick={() => act((s) => runCampaign(s, 'small'), 'coin')}>
          Small ads {money(1500)}
        </button>
        {game.research.includes('marketing') && (
          <button className="secondary" onClick={() => act((s) => runCampaign(s, 'big'), 'coin')}>
            Big ads {money(6000)}
          </button>
        )}
        <button className="secondary" onClick={() => act(writeDevDiary)} title="Costs a little work. Fan mood +6, hype +3.">
          Dev diary
        </button>
      </div>
    </div>
  )
}

function FocusSliders({ focus, onChange, ideal }: { focus: Focus; onChange: (f: Focus) => void; ideal: Focus | null }) {
  const total = SKILLS.reduce((sum, s) => sum + focus[s], 0)
  return (
    <div className="sliders">
      <div className="slider-head">
        <span>Focus</span>
        <span className={total === 100 ? 'muted' : 'bad'}>{total}/100</span>
      </div>
      {SKILLS.map((s) => (
        <label key={s} className="slider">
          <span>{SKILL_LABEL[s]}</span>
          <input type="range" min={0} max={60} step={5} value={focus[s]} onChange={(e) => onChange({ ...focus, [s]: Number(e.target.value) })} />
          <span className="slider-value">
            {focus[s]}
            {ideal && <i title="What worked last time"> ★{ideal[s]}</i>}
          </span>
        </label>
      ))}
      {total !== 100 && (
        <button type="button" className="link" onClick={() => onChange(normalizeFocus(focus))}>
          Balance to 100
        </button>
      )}
    </div>
  )
}

const START_FOCUS: Focus = { design: 25, tech: 25, art: 20, sound: 10, story: 5, polish: 15 }

function NewGameForm({ game, act }: { game: GameState; act: Act }) {
  const genres = unlockedGenres(game.week)
  const topics = unlockedTopics(game.week)
  const sizes = availableSizes(game)
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState<Genre>(genres[0] ?? 'arcade')
  const [topic, setTopic] = useState<Topic>(topics[1] ?? 'space')
  const [size, setSize] = useState<GameSize>('S')
  const [platform, setPlatform] = useState<PlatformId>(game.platforms[game.platforms.length - 1] ?? 'vector64')
  const [engine, setEngine] = useState<EngineId>(game.engines[game.engines.length - 1] ?? 'tinker')
  const [focus, setFocus] = useState<Focus>(START_FOCUS)
  const [sequelOf, setSequelOf] = useState('')
  const known = useMemo(() => new Set(game.releases.map((r) => r.genre)), [game.releases])
  const ideal = known.has(genre) ? GENRES[genre].ideal : null
  const combo = game.research.includes('marketResearch') ? comboLabel(genre, topic) : null
  const sequelOptions = game.releases.filter((r) => r.score >= 6)

  return (
    <form
      className="panel-body"
      onSubmit={(event) => {
        event.preventDefault()
        const finalTitle = title.trim() || `${TOPICS[topic].label} ${GENRES[genre].label}`
        act((s) => startProject(s, { title: finalTitle, genre, topic, size, platform, engine, focus: normalizeFocus(focus), ...(sequelOf ? { sequelOf } : {}) }))
        setTitle('')
      }}
    >
      <h2>New game</h2>
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={40} placeholder={`${TOPICS[topic].label} ${GENRES[genre].label}`} />
      </label>
      <div className="grid2">
        <label>
          Genre
          <select value={genre} onChange={(e) => setGenre(e.target.value as Genre)}>
            {genres.map((g) => (
              <option key={g} value={g}>
                {GENRES[g].label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Topic
          <select value={topic} onChange={(e) => setTopic(e.target.value as Topic)}>
            {topics.map((t) => (
              <option key={t} value={t}>
                {TOPICS[t].label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Size
          <select value={size} onChange={(e) => setSize(e.target.value as GameSize)}>
            {sizes.map((z) => (
              <option key={z} value={z}>
                {z} · {SIZES[z].weeks} weeks
              </option>
            ))}
          </select>
        </label>
        <label>
          Platform
          <select value={platform} onChange={(e) => setPlatform(e.target.value as PlatformId)}>
            {game.platforms.map((p) => (
              <option key={p} value={p}>
                {PLATFORMS[p].label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Engine
          <select value={engine} onChange={(e) => setEngine(e.target.value as EngineId)}>
            {game.engines.map((e) => (
              <option key={e} value={e}>
                {e === 'own' ? `Own engine L${game.ownEngine?.level}` : ENGINES[e].label} · tech {engineTech(game, e).toFixed(1)}
              </option>
            ))}
          </select>
        </label>
        {sequelOptions.length > 0 && (
          <label>
            Sequel to
            <select value={sequelOf} onChange={(e) => setSequelOf(e.target.value)}>
              <option value="">Nothing (new game)</option>
              {sequelOptions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {combo && <p className={`combo ${combo}`}>Market research: {combo === 'great' ? 'a great match!' : combo === 'good' ? 'a decent match.' : 'these do not mix.'}</p>}
      {engine !== 'own' && yearOf(game.week) - ENGINES[engine].year >= 4 && <p className="bad small">This engine is {yearOf(game.week) - ENGINES[engine].year} years old. Critics will notice.</p>}
      <FocusSliders focus={focus} onChange={setFocus} ideal={ideal} />
      <button type="submit">Start development</button>
    </form>
  )
}
