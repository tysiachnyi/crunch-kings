import { useState } from 'react'
import {
  ENGINES,
  GENRES,
  PHASES,
  PLATFORMS,
  SIZES,
  SKILLS,
  TOPICS,
  availableSizes,
  comboLabel,
  engineTech,
  phaseLengths,
  phaseShares,
  projectQuality,
  runCampaign,
  setCrunch,
  startProject,
  unlockedGenres,
  unlockedTopics,
  writeDevDiary,
  yearOf,
} from '@crunch-kings/game-core'
import type { EngineId, GameProject, GameSize, GameState, Genre, PlatformId, Skill, Topic } from '@crunch-kings/game-core'
import { money } from '../format'

type Act = (change: (state: GameState) => GameState, sound?: 'click' | 'coin' | 'research' | 'hire') => void

const SKILL_LABEL: Record<Skill, string> = { design: 'Design', tech: 'Tech', art: 'Art', sound: 'Sound', story: 'Story', polish: 'Polish' }

export function ProjectPanel({ game, act }: { game: GameState; act: Act }) {
  if (game.project) return <ProjectProgress game={game} act={act} />
  if (game.activeContract) {
    const c = game.activeContract
    return (
      <div className="panel-body">
        <p className="kicker">Contract</p>
        <h2>{c.client}</h2>
        <p className="muted">{c.task}</p>
        <Meter label={`${SKILL_LABEL[c.skill]} work`} value={c.progress} max={c.required} />
        <dl className="facts">
          <div>
            <dt>Pays</dt>
            <dd>{money(c.pay)}</dd>
          </div>
          <div>
            <dt>Weeks left</dt>
            <dd>{c.weeksLeft}</dd>
          </div>
          <div>
            <dt>Penalty</dt>
            <dd>{money(c.penalty)}</dd>
          </div>
        </dl>
      </div>
    )
  }
  return <NewGameForm game={game} act={act} />
}

function Meter({ label, value, max, tone, unit = '' }: { label: string; value: number; max: number; tone?: string; unit?: string }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100))
  return (
    <div className="meter">
      <div className="meter-label">
        <span>{label}</span>
        <span>
          {Math.round(value)}
          {unit}
        </span>
      </div>
      <div className="meter-track">
        <div className={`meter-fill ${tone ?? ''}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function PhaseBar({ project }: { project: GameProject }) {
  const lengths = phaseLengths(project.totalWeeks)
  const testing = project.weeksLeft <= 1
  const shares = phaseShares(project.phaseWeights[project.phase]!)
  const running = !project.awaitingPhase && !testing
  return (
    <div className="phase-bar">
      <p className="phase-title">
        Phase {project.phase + 1} of {PHASES.length} - {PHASES[project.phase]!.label}
      </p>
      <div className="phase-track" role="img" aria-label={`Phase ${project.phase + 1} of ${PHASES.length}`}>
        {PHASES.map((phase, i) => {
          const fill = i < project.phase ? 1 : i > project.phase ? 0 : project.awaitingPhase ? 0 : (lengths[i]! - project.phaseWeeksLeft) / lengths[i]!
          return (
            <div key={phase.label} className={`phase-seg ${i === project.phase ? 'current' : ''}`}>
              <div className="phase-fill" style={{ width: `${Math.min(1, fill + (testing && i === PHASES.length - 1 ? 1 : 0)) * 100}%` }} />
              <span>{phase.label}</span>
            </div>
          )
        })}
      </div>
      {running ? (
        <div className="points three">
          {PHASES[project.phase]!.aspects.map((aspect, i) => (
            <Meter key={aspect.label} label={aspect.label} value={shares[i]! * 100} max={100} tone="soft" unit="%" />
          ))}
        </div>
      ) : (
        <p className="small muted">{testing ? 'The team tests the game and removes bugs.' : 'Waiting for your decision.'}</p>
      )}
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
      <p className="kicker">In development</p>
      <h2>{p.title}</h2>
      <p className="muted">
        {GENRES[p.genre].label} · {TOPICS[p.topic].label} · size {p.size} · {PLATFORMS[p.platform].label}
        {p.sequelOf ? ' · sequel' : ''}
      </p>
      <PhaseBar project={p} />
      <Meter label={p.weeksLeft <= 1 ? 'Testing week' : `Week ${done} of ${p.totalWeeks}`} value={done} max={p.totalWeeks} />
      <div className="points">
        {SKILLS.map((s) => (
          <Meter key={s} label={SKILL_LABEL[s]} value={p.points[s]} max={maxPoints} tone="soft" />
        ))}
      </div>
      <dl className="facts">
        <div>
          <dt>Bugs</dt>
          <dd className={p.bugs > 10 ? 'bad' : undefined}>{Math.round(p.bugs)}</dd>
        </div>
        <div>
          <dt>Hype</dt>
          <dd>{Math.round(p.hype + game.hype)}</dd>
        </div>
        {predicted !== null && (
          <div>
            <dt>Playtest guess</dt>
            <dd>{predicted.toFixed(1)}</dd>
          </div>
        )}
      </dl>
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
  const [sequelOf, setSequelOf] = useState('')
  const combo = game.research.includes('marketResearch') ? comboLabel(genre, topic) : null
  const sequelOptions = game.releases.filter((r) => r.score >= 6)

  return (
    <form
      className="panel-body"
      onSubmit={(event) => {
        event.preventDefault()
        const finalTitle = title.trim() || `${TOPICS[topic].label} ${GENRES[genre].label}`
        act((s) => startProject(s, { title: finalTitle, genre, topic, size, platform, engine, ...(sequelOf ? { sequelOf } : {}) }))
        setTitle('')
      }}
    >
      <p className="kicker">Project</p>
      <h2>New game</h2>
      <label>
        Title
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={40} placeholder={`${TOPICS[topic].label} ${GENRES[genre].label}`} />
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
      <button type="submit">Start development</button>
    </form>
  )
}
