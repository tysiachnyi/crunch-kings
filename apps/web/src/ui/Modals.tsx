import { useEffect, useState } from 'react'
import { GENRES, PHASES, PHASE_WEIGHT_MAX, PHASE_WEIGHT_STEP, PLATFORMS, SKILLS, TOPICS, dateLabel, idealPhaseWeights, phasePoints, phaseShares } from '@crunch-kings/game-core'
import type { GameState, PendingEvent, PhaseWeights } from '@crunch-kings/game-core'
import { count, money, score } from '../format'
import { play } from '../sound'
import { Badges, RegionBars } from './SalesDesk'

export function EventModal({ event, onChoose }: { event: PendingEvent; onChoose: (id: string) => void }) {
  return (
    <div className="overlay">
      <div className="modal card-pop">
        <p className="kicker">News for the studio</p>
        <h2>{event.title}</h2>
        <p className="event-text">{event.text}</p>
        <div className="choices">
          {event.choices.map((c, i) => (
            <button key={c.id} className={i === 0 ? '' : 'secondary'} onClick={() => onChoose(c.id)} autoFocus={i === 0}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const SKILL_LABEL = { design: 'Design', tech: 'Tech', art: 'Art', sound: 'Sound', story: 'Story', polish: 'Polish' } as const

export function PhaseSheet({ game, onDecide }: { game: GameState; onDecide: (weights: PhaseWeights) => void }) {
  const project = game.project!
  const phase = PHASES[project.phase]!
  const last = project.phase === PHASES.length - 1
  const [weights, setWeights] = useState<PhaseWeights>([20, 20, 20])
  useEffect(() => setWeights([20, 20, 20]), [project.phase, project.title])
  const shares = phaseShares(weights)
  const known = game.releases.some((r) => r.genre === project.genre)
  const ideal = known ? idealPhaseWeights(project.genre)[project.phase]! : null
  const gained = phasePoints(project)
  const ended = project.phase > 0 ? PHASES[project.phase - 1]!.label : null
  return (
    <div className="overlay">
      <form
        className="modal phase card-pop"
        onSubmit={(event) => {
          event.preventDefault()
          onDecide(weights)
        }}
      >
        <p className="kicker">
          Phase {project.phase + 1} of {PHASES.length}
        </p>
        <h2>{phase.label}</h2>
        <p className="muted">
          {project.title} · {GENRES[project.genre].label} · {TOPICS[project.topic].label}
        </p>
        <p className="small">{phase.text}</p>
        {ended && (
          <div className="report">
            <p className="report-head">Report: {ended}</p>
            <dl className="facts">
              {SKILLS.filter((s) => gained[s] >= 0.5).map((s) => (
                <div key={s}>
                  <dt>{SKILL_LABEL[s]}</dt>
                  <dd>+{Math.round(gained[s])}</dd>
                </div>
              ))}
              <div>
                <dt>Bugs</dt>
                <dd className={project.bugs > 10 ? 'bad' : undefined}>{Math.round(project.bugs)}</dd>
              </div>
            </dl>
          </div>
        )}
        <div className="sliders wide">
          <div className="slider-head">
            <span>Where the team works</span>
            <span className="muted">Share</span>
          </div>
          {phase.aspects.map((aspect, i) => (
            <div key={aspect.label} className="aspect">
              <label className="slider">
                <span>{aspect.label}</span>
                <input
                  type="range"
                  min={0}
                  max={PHASE_WEIGHT_MAX}
                  step={PHASE_WEIGHT_STEP}
                  value={weights[i]}
                  onChange={(e) => setWeights(weights.map((w, j) => (j === i ? Number(e.target.value) : w)) as PhaseWeights)}
                />
                <span className="slider-value">
                  {Math.round(shares[i]! * 100)}%
                  {ideal && <i title="What worked last time"> ★{ideal[i]}%</i>}
                </span>
              </label>
              <p className="small muted">
                {aspect.text} Feeds {SKILL_LABEL[aspect.skill].toLowerCase()}.
              </p>
            </div>
          ))}
        </div>
        <button type="submit">{last ? 'Start the last phase' : 'Start phase'}</button>
      </form>
    </div>
  )
}

function SalesChart({ weekly }: { weekly: number[] }) {
  const max = Math.max(...weekly, 1)
  const w = 280
  const h = 70
  const points = weekly.map((v, i) => `${(i / (weekly.length - 1)) * w},${h - (v / max) * h}`).join(' ')
  return (
    <svg className="sales-chart" viewBox={`0 0 ${w} ${h + 4}`} role="img" aria-label="Expected weekly sales">
      <defs>
        <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line className="hatch-line" x1="0" y1="0" x2="0" y2="5" />
        </pattern>
      </defs>
      <polyline points={`0,${h} ${points} ${w},${h}`} className="area" />
      <polyline points={points} className="line" />
      <line className="base" x1="0" y1={h + 0.5} x2={w} y2={h + 0.5} />
    </svg>
  )
}

export function ReleaseDay({ game, releaseId, onClose }: { game: GameState; releaseId: string; onClose: () => void }) {
  const release = game.releases.find((r) => r.id === releaseId)
  const [opened, setOpened] = useState(0)
  const isNew = release?.week === game.week
  useEffect(() => {
    if (!release) return
    if (!isNew) {
      setOpened(release.reviews.length + 1)
      return
    }
    if (opened > release.reviews.length) return
    const timer = setTimeout(() => {
      setOpened((n) => n + 1)
      play(opened < release.reviews.length ? 'review' : 'coin')
    }, opened === 0 ? 500 : 650)
    return () => clearTimeout(timer)
  }, [opened, release, isNew])
  if (!release) return null
  const all = opened > release.reviews.length
  const neighbors = game.rivalReleases.filter((r) => Math.abs(r.week - release.week) <= 6).slice(-4)
  const planned = release.weeklySales.reduce((a, b) => a + b, 0)
  return (
    <div className="overlay">
      <div className="modal release card-pop">
        <p className="kicker">
          Release day · {dateLabel(release.week)} · {PLATFORMS[release.platform].label}
        </p>
        <h2>{release.title}</h2>
        <p className="muted">
          {GENRES[release.genre].label} · {TOPICS[release.topic].label} · size {release.size}
        </p>
        <div className="reviews">
          {release.reviews.map((r, i) => (
            <div key={r.outlet} className={`review-card ${i < opened ? 'open' : ''}`}>
              {i < opened ? (
                <>
                  <div className="review-score">{r.score}</div>
                  <div>
                    <b>{r.outlet}</b>
                    <p className="small">{r.quote}</p>
                  </div>
                </>
              ) : (
                <div className="envelope">Sealed</div>
              )}
            </div>
          ))}
        </div>
        {all && (
          <div className="release-summary">
            <div className="big-score">
              {score(release.score)}
              <small>of 10</small>
            </div>
            <div>
              {release.hint && <p className="hint">{release.hint}</p>}
              <p className="small">
                Chart rank <b>#{release.chartRank}</b> · fans +{count(release.fansGained)} · expected copies about {count(planned)}
              </p>
              <SalesChart weekly={release.weeklySales} />
              {neighbors.length > 0 && (
                <p className="small muted">
                  Same weeks: {neighbors.map((n) => `${n.title} (${n.score})`).join(', ')}
                </p>
              )}
              {!isNew && (
                <>
                  <p className="small">
                    Sold so far: {count(release.totalSales)} · {money(release.revenue)}
                  </p>
                  <Badges badges={release.badges} />
                  {release.totalSales > 0 && <RegionBars release={release} />}
                </>
              )}
            </div>
          </div>
        )}
        <button onClick={onClose} disabled={!all} autoFocus={all} key={all ? "done" : "wait"}>
          {all ? 'Back to work' : 'Opening the mail…'}
        </button>
      </div>
    </div>
  )
}

export function EndingScreen({ game, onRestart }: { game: GameState; onRestart: () => void }) {
  const best = [...game.releases].sort((a, b) => b.score - a.score)[0]
  const sold = game.releases.reduce((s, r) => s + r.totalSales, 0)
  const wins = game.awards.filter((a) => a.player).length
  const pal = game.staff.find((e) => e.kind === 'friend')
  const bankrupt = game.ending === 'bankrupt'
  return (
    <div className="overlay ending">
      <div className="modal card-pop">
        <p className="kicker">{bankrupt ? 'The end' : 'End of the demo'}</p>
        <h1>{bankrupt ? `${game.studioName} closes` : `${game.studioName}: the garage years`}</h1>
        <p>
          {bankrupt
            ? 'The bank takes the computers. The garage goes back to being a garage. But somebody, somewhere, still plays your games.'
            : 'Ten years, one garage, too much pizza. You made it through the 80s.'}
        </p>
        <div className="stats">
          <div>
            <b>{game.releases.length}</b>
            <span>games</span>
          </div>
          <div>
            <b>{count(sold)}</b>
            <span>copies</span>
          </div>
          <div>
            <b>{count(game.fans)}</b>
            <span>fans</span>
          </div>
          <div>
            <b>{wins}</b>
            <span>awards</span>
          </div>
          <div>
            <b>{money(game.money)}</b>
            <span>in the bank</span>
          </div>
        </div>
        {best && (
          <p>
            Best game: <b>{best.title}</b> ({score(best.score)}/10).
          </p>
        )}
        {pal && <p className="muted">{pal.name} keeps a photo of the first day on the wall.</p>}
        {!bankrupt && (
          <div className="teaser">
            <p>
              <b>1990.</b> A new studio moves in across the street. Their mascot is a gorilla in sunglasses. They make shooters. They are loud. They are called <b>Giga Gorilla</b>.
            </p>
            <p className="small">The console wars start in the full game.</p>
          </div>
        )}
        <button onClick={onRestart}>Start a new studio</button>
      </div>
    </div>
  )
}
