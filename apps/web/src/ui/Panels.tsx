import { useState } from 'react'
import {
  ENGINES,
  GENRES,
  MILESTONES,
  OFFICES,
  PLATFORMS,
  RESEARCH,
  SKILLS,
  TRAITS,
  availableEngines,
  availablePlatforms,
  buyEngine,
  buyPlatform,
  buyResearch,
  canMove,
  capacity,
  contractsOpen,
  dateLabel,
  expectationBefore,
  fire,
  hire,
  monthlyCosts,
  moodFace,
  moveOffice,
  researchAvailable,
  takeContract,
  train,
  weeklyIncome,
  yearOf,
} from '@crunch-kings/game-core'
import type { Candidate, Employee, GameState, ResearchId, Skill } from '@crunch-kings/game-core'
import { count, money } from '../format'

type Act = (change: (state: GameState) => GameState, sound?: 'click' | 'coin' | 'research' | 'hire') => void

const SKILL_SHORT: Record<Skill, string> = { design: 'DES', tech: 'TEC', art: 'ART', sound: 'SND', story: 'STR', polish: 'POL' }

function SkillRow({ person }: { person: Pick<Employee, 'skills'> }) {
  return (
    <div className="skills">
      {SKILLS.map((s) => (
        <span key={s} title={s}>
          <i>{SKILL_SHORT[s]}</i>
          {person.skills[s].toFixed(person.skills[s] % 1 ? 1 : 0)}
        </span>
      ))}
    </div>
  )
}

function Traits({ traits }: { traits: Employee['traits'] }) {
  if (traits.length === 0) return null
  return (
    <div className="traits">
      {traits.map((t) => (
        <span key={t} className="chip" title={TRAITS[t].text}>
          {TRAITS[t].label}
        </span>
      ))}
    </div>
  )
}

export function TeamPanel({ game, act, focusName }: { game: GameState; act: Act; focusName?: string | null }) {
  const [trainSkill, setTrainSkill] = useState<Skill>('tech')
  const full = game.staff.length >= capacity(game)
  return (
    <div className="panel-body">
      <h2>
        Team {game.staff.length}/{capacity(game)}
      </h2>
      <p className="muted small">Monthly costs: {money(monthlyCosts(game))}</p>
      {game.staff.map((e) => (
        <div key={e.id} className={`person ${focusName && e.name.startsWith(focusName) ? 'highlight' : ''}`}>
          <div className="person-head">
            <b>{e.name}</b>
            <span className="muted">
              {e.kind === 'founder' ? 'founder' : e.kind === 'friend' ? 'garage friend' : e.role} · {money(e.salary)}/mo
            </span>
          </div>
          <SkillRow person={e} />
          <Traits traits={e.traits} />
          <div className="person-stats small">
            <span>Morale {Math.round(e.morale)}</span>
            <span className={e.stress > 60 ? 'bad' : undefined}>Stress {Math.round(e.stress)}</span>
            {e.burnoutWeeks > 0 && <span className="bad">Burnout {e.burnoutWeeks}w</span>}
          </div>
          <div className="row">
            {game.research.includes('trainingRoom') && (
              <>
                <select value={trainSkill} onChange={(ev) => setTrainSkill(ev.target.value as Skill)}>
                  {SKILLS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <button className="secondary" onClick={() => act((s) => train(s, e.id, trainSkill), 'research')}>
                  Train
                </button>
              </>
            )}
            {e.kind !== 'founder' && (
              <button
                className="link"
                onClick={() => {
                  if (confirm(`Fire ${e.name}? It costs two months of salary.`)) act((s) => fire(s, e.id))
                }}
              >
                Fire
              </button>
            )}
          </div>
        </div>
      ))}
      <h3>Candidates this month</h3>
      {full && <p className="muted small">The {OFFICES[game.office].label.toLowerCase()} is full. Move to a bigger office to hire.</p>}
      {game.candidates.map((c: Candidate) => (
        <div key={c.id} className="person candidate">
          <div className="person-head">
            <b>{c.name}</b>
            <span className="muted">
              {c.role} · {money(c.salary)}/mo
            </span>
          </div>
          <SkillRow person={c} />
          <Traits traits={c.traits} />
          <button disabled={full} onClick={() => act((s) => hire(s, c.id), 'hire')}>
            Hire ({money(c.salary)} fee)
          </button>
        </div>
      ))}
    </div>
  )
}

export function ResearchPanel({ game, act }: { game: GameState; act: Act }) {
  const ids = Object.keys(RESEARCH) as ResearchId[]
  return (
    <div className="panel-body">
      <h2>Research</h2>
      <p className="muted small">You have {Math.floor(game.researchPoints)} research points. Releases and idle weeks give more.</p>
      {ids.map((id) => {
        const node = RESEARCH[id]
        const done = game.research.includes(id)
        const open = researchAvailable(game, id)
        return (
          <div key={id} className={`node ${done ? 'done' : open ? '' : 'locked'}`}>
            <div className="person-head">
              <b>{node.label}</b>
              <span className="muted small">{done ? 'done' : `${node.rp} RP · ${money(node.cost)}`}</span>
            </div>
            <p className="small">{node.text}</p>
            {!done && open && (
              <button className="secondary" disabled={game.researchPoints < node.rp} onClick={() => act((s) => buyResearch(s, id), 'research')}>
                Research
              </button>
            )}
            {!done && !open && node.requires && <p className="muted small">Needs {RESEARCH[node.requires].label}.</p>}
          </div>
        )
      })}
    </div>
  )
}

export function BusinessPanel({ game, act }: { game: GameState; act: Act }) {
  const platforms = availablePlatforms(game.week).filter((p) => !game.platforms.includes(p))
  const engines = availableEngines(game.week).filter((e) => !game.engines.includes(e))
  return (
    <div className="panel-body">
      <h2>Business</h2>
      <p className="small">
        Weekly sales: <b>{money(weeklyIncome(game))}</b> · Monthly costs: <b>{money(monthlyCosts(game))}</b>
      </p>
      {game.loan && (
        <p className="small bad">
          Rescue loan: {money(game.loan.weeklyPayment)} a week for {game.loan.weeksLeft} more weeks.
        </p>
      )}
      <h3>Contracts</h3>
      {!contractsOpen(game) && <p className="muted small">Ship your first game to get contract offers.</p>}
      {game.contracts.map((c) => (
        <div key={c.id} className="node">
          <div className="person-head">
            <b>{c.client}</b>
            <span className="muted small">
              {money(c.pay)} · {c.weeksLeft} weeks
            </span>
          </div>
          <p className="small">
            {c.task}. Needs {c.required} {c.skill} points.
          </p>
          <button className="secondary" disabled={!!game.project || !!game.activeContract} onClick={() => act((s) => takeContract(s, c.id))}>
            Take contract
          </button>
        </div>
      ))}
      <h3>Office</h3>
      <p className="small">
        {OFFICES[game.office].label}: room for {OFFICES[game.office].capacity}, rent {money(OFFICES[game.office].rent)}/mo.
      </p>
      {game.office === 'garage' && (
        <button disabled={!canMove(game, 'smallOffice')} onClick={() => act((s) => moveOffice(s, 'smallOffice'), 'coin')} title="Opens after your first profitable year">
          Move to a small office ({money(OFFICES.smallOffice.moveCost)})
        </button>
      )}
      {game.office === 'garage' && !canMove(game, 'smallOffice') && <p className="muted small">Opens after your first profitable year.</p>}
      <h3>Platform licenses</h3>
      {game.platforms.map((p) => (
        <p key={p} className="small">
          ✓ {PLATFORMS[p].label} <span className="muted">({PLATFORMS[p].kind})</span>
        </p>
      ))}
      {platforms.map((p) => (
        <button key={p} className="secondary" onClick={() => act((s) => buyPlatform(s, p), 'coin')}>
          {PLATFORMS[p].label} devkit ({money(PLATFORMS[p].license)})
        </button>
      ))}
      <h3>Engines</h3>
      {game.engines.map((e) => (
        <p key={e} className="small">
          ✓ {e === 'own' ? `Own engine, level ${game.ownEngine?.level}` : ENGINES[e].label}
        </p>
      ))}
      {engines.map((e) => (
        <button key={e} className="secondary" onClick={() => act((s) => buyEngine(s, e), 'coin')}>
          {ENGINES[e].label}: tech {ENGINES[e].tech} ({money(ENGINES[e].fee)}
          {ENGINES[e].royalty ? `, ${ENGINES[e].royalty * 100}% royalty` : ''})
        </button>
      ))}
      <h3>Milestones</h3>
      {[...MILESTONES.map((m) => ({ id: m.id, text: m.text })), { id: 'profitableYear', text: 'First profitable year. A small office opens.' }].map((m) => (
        <p key={m.id} className={`small ${game.milestones.includes(m.id) ? '' : 'muted'}`}>
          {game.milestones.includes(m.id) ? '★' : '☆'} {m.text}
        </p>
      ))}
    </div>
  )
}

export function FansPanel({ game }: { game: GameState }) {
  const f = game.fandom
  return (
    <div className="panel-body">
      <h2>
        Fans {moodFace(f.mood)}
      </h2>
      <p>
        <b>{count(game.fans)}</b> fans · mood <b>{Math.round(f.mood)}</b>/100
      </p>
      <div className="meter-track mood">
        <div className="meter-fill" style={{ width: `${f.mood}%` }} />
      </div>
      <p className="small">Fans expect a score of about <b>{expectationBefore(game.releases).toFixed(1)}</b> from your next game.</p>
      {f.reviewBombWeeks > 0 && <p className="bad small">Review bomb in progress: {f.reviewBombWeeks} weeks left.</p>}
      <h3>Demands</h3>
      {f.demands.length === 0 && <p className="muted small">Nobody demands anything. Enjoy it.</p>}
      {f.demands.map((d) => (
        <p key={d.id} className="small">
          📜 {d.text} <span className="muted">(open {game.week - d.openedWeek} weeks)</span>
        </p>
      ))}
      <p className="muted small">Mood above 80 brings fan art. Below 25, the next release gets review-bombed. A dev diary helps while you build.</p>
    </div>
  )
}

export function RivalsPanel({ game }: { game: GameState }) {
  const year = yearOf(game.week)
  const alive = game.rivals.filter((r) => r.alive && r.openYear <= year)
  const recent = [...game.rivalReleases].reverse().slice(0, 8)
  return (
    <div className="panel-body">
      <h2>Rivals</h2>
      {alive.map((r) => (
        <div key={r.id} className="node">
          <div className="person-head">
            <b>{r.name}</b>
            <span className="muted small">{count(r.fans)} fans</span>
          </div>
          <p className="small muted">{r.genres.map((g) => GENRES[g].label).join(', ')}</p>
        </div>
      ))}
      <h3>Recent releases</h3>
      {recent.length === 0 && <p className="muted small">Quiet so far.</p>}
      {recent.map((r, i) => (
        <p key={`${r.title}-${i}`} className="small">
          <b>{r.score}</b> {r.title} <span className="muted">· {game.rivals.find((x) => x.id === r.rivalId)?.name}</span>
        </p>
      ))}
      <h3>Golden Cartridge Awards</h3>
      {game.awards.length === 0 && <p className="muted small">The first show is in December.</p>}
      {[...game.awards].reverse().slice(0, 9).map((a, i) => (
        <p key={i} className={`small ${a.player ? 'good' : ''}`}>
          {a.player ? '🏆' : '·'} {a.year} {a.category}: "{a.title}" ({a.winner})
        </p>
      ))}
    </div>
  )
}

export function LogPanel({ game }: { game: GameState }) {
  return (
    <div className="panel-body">
      <h2>Studio log</h2>
      {[...game.log].reverse().slice(0, 60).map((entry, i) => (
        <p key={i} className={`small log-${entry.tone ?? 'plain'}`}>
          <span className="muted">{dateLabel(entry.week)}</span> {entry.text}
        </p>
      ))}
    </div>
  )
}

export function ReleasesPanel({ game, onOpen }: { game: GameState; onOpen: (id: string) => void }) {
  return (
    <div className="panel-body">
      <h2>Your games</h2>
      {game.releases.length === 0 && <p className="muted small">No games yet. The garage waits.</p>}
      {[...game.releases].reverse().map((r) => (
        <button key={r.id} className="release-row" onClick={() => onOpen(r.id)}>
          <b>{r.score}</b>
          <span>{r.title}</span>
          <span className="muted small">
            {count(r.totalSales)} sold · {money(r.revenue)}
          </span>
        </button>
      ))}
    </div>
  )
}
