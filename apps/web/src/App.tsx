import { useEffect, useState } from 'react'
import { OfficeCanvas } from '@crunch-kings/scene'
import type { ScenePerson } from '@crunch-kings/scene'
import { dateLabel, moodFace, money, weeklyIncome } from '@crunch-kings/game-core'
import type { GameState } from '@crunch-kings/game-core'
import { NewStudio } from './NewStudio'
import { count } from './format'
import { isMuted, play, setMuted } from './sound'
import { BusinessPanel, FansPanel, LogPanel, ReleasesPanel, ResearchPanel, RivalsPanel, TeamPanel } from './ui/Panels'
import { EndingScreen, EventModal, ReleaseDay } from './ui/Modals'
import { ProjectPanel } from './ui/ProjectPanel'
import { Tutorial, resetTutorial } from './ui/Tutorial'
import { SPEEDS, hasSave, useGame } from './useGame'

const TABS = ['Project', 'Team', 'Research', 'Business', 'Fans', 'Rivals', 'Games', 'Log'] as const
type Tab = (typeof TABS)[number]

const PROP_LINES: Record<string, string> = {
  Cooler: 'The water cooler. Gossip central.',
  Plant: 'Gerald the plant. Survives everything.',
  Shelf: 'Manuals nobody reads, and one trophy slot waiting.',
  Pizza: 'Cold pizza. Breakfast of champions.',
  Box: 'Boxes of unsold copies. Or future collectibles.',
  Bin: 'Rejected design docs live here.',
  Desk: 'A desk. Coffee rings tell its story.',
  Chair: 'A chair that squeaks in C major.',
}

function scenePeople(game: GameState): ScenePerson[] {
  return game.staff.map((e) => ({ id: e.id, name: e.name, role: e.role, kind: e.kind, burnout: e.burnoutWeeks > 0 }))
}

function TitleMenu({ onContinue, onNew, canContinue }: { onContinue: () => void; onNew: () => void; canContinue: boolean }) {
  const [muted, setMutedState] = useState(isMuted())
  const [help, setHelp] = useState(false)
  return (
    <div className="card setup menu">
      <h1>Crunch Kings</h1>
      <p className="tagline">Start in a garage. End in the history books.</p>
      {canContinue && (
        <button onClick={onContinue} autoFocus>
          Continue
        </button>
      )}
      <button className={canContinue ? 'secondary' : ''} onClick={onNew}>
        New studio
      </button>
      <button className="secondary" onClick={() => setHelp(!help)}>
        How to play
      </button>
      {help && (
        <div className="help small">
          <p>Run a game studio from 1980 to 1989. Make games, read the reviews, pay the bills, beat the rivals, keep the fans happy.</p>
          <p>
            <b>Space</b> pause or play · <b>1 2 3</b> speed · <b>Esc</b> close a window · the game saves itself.
          </p>
          <button
            className="link"
            onClick={() => {
              resetTutorial()
              setHelp(false)
            }}
          >
            Show the tips again
          </button>
        </div>
      )}
      <label className="toggle">
        <input
          type="checkbox"
          checked={!muted}
          onChange={(e) => {
            setMuted(!e.target.checked)
            setMutedState(!e.target.checked)
            play('click')
          }}
        />
        Sound effects
      </label>
      <p className="muted small">Demo: the garage years, 1980-1989.</p>
    </div>
  )
}

export function App() {
  const g = useGame()
  const { game } = g
  const [screen, setScreen] = useState<'menu' | 'setup' | 'play'>('menu')
  const [tab, setTab] = useState<Tab>('Project')
  const [panelOpen, setPanelOpen] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (screen !== 'play' || !game) return
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') return
      if (event.code === 'Space') {
        event.preventDefault()
        g.setRunning(!g.running)
      }
      if (event.key === '1' || event.key === '2' || event.key === '3') g.setSpeed(SPEEDS[Number(event.key) - 1]!)
      if (event.key === 'Escape') {
        if (g.releaseView) g.setReleaseView(null)
        else setSelected(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [screen, game, g])

  if (screen !== 'play' || !game) {
    return (
      <div className="game">
        <OfficeCanvas office={game?.office ?? 'garage'} people={game ? scenePeople(game) : undefined} working={false} />
        {screen === 'setup' ? (
          <NewStudio
            onBack={() => setScreen('menu')}
            onFound={(setup) => {
              g.foundStudio(setup)
              setTab('Project')
              setScreen('play')
              play('fanfare')
            }}
          />
        ) : (
          <TitleMenu canContinue={!!game && hasSave()} onContinue={() => setScreen('play')} onNew={() => setScreen('setup')} />
        )}
      </div>
    )
  }

  const event = game.pendingEvents[0]
  const income = weeklyIncome(game)
  const seatIndex = selected?.startsWith('Dev_') ? Number(selected.slice(4)) - 1 : -1
  const person = seatIndex >= 0 ? game.staff[seatIndex] : undefined
  const selectedLine = person
    ? `${person.name}: morale ${Math.round(person.morale)}, stress ${Math.round(person.stress)}${person.burnoutWeeks > 0 ? ', burned out' : ''}.`
    : selected
      ? (Object.entries(PROP_LINES).find(([k]) => selected.startsWith(k))?.[1] ?? null)
      : null

  return (
    <div className="game">
      <div className={`scene ${panelOpen ? 'with-panel' : ''}`}>
        <OfficeCanvas
          office={game.office}
          people={scenePeople(game)}
          working={g.running && (!!game.project || !!game.activeContract)}
          crunch={game.project?.crunch ?? false}
          onSelect={(name) => {
            setSelected(name)
            if (name?.startsWith('Dev_')) {
              setTab('Team')
              setPanelOpen(true)
            }
          }}
        />
      </div>

      <header className="hud">
        <strong className="studio">{game.studioName}</strong>
        <span>{dateLabel(game.week)}</span>
        <span className={game.money < 0 ? 'bad' : undefined} title={`Weekly sales ${money(income)}`}>
          {money(game.money)}
        </span>
        <span title={`Fan mood ${Math.round(game.fandom.mood)}/100`}>
          {moodFace(game.fandom.mood)} {count(game.fans)}
        </span>
        <span title="Studio hype" className="muted">
          ✨{Math.round(game.hype)}
        </span>
        <span title="Research points" className="muted">
          🔬{Math.floor(game.researchPoints)}
        </span>
        <div className="speed">
          <button onClick={() => g.setRunning(!g.running)} className={g.running ? 'secondary' : ''} aria-label={g.running ? 'Pause' : 'Play'}>
            {g.running ? '❚❚' : '▶'}
          </button>
          {SPEEDS.map((s) => (
            <button key={s} className={`secondary small-btn ${g.speed === s ? 'active' : ''}`} onClick={() => g.setSpeed(s)}>
              {s}x
            </button>
          ))}
        </div>
        <button className="link" onClick={() => setScreen('menu')}>
          Menu
        </button>
      </header>

      <aside className={`card side ${panelOpen ? '' : 'closed'}`}>
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t}
              className={`tab ${tab === t ? 'active' : ''}`}
              onClick={() => {
                setTab(t)
                setPanelOpen(true)
                play('click')
              }}
            >
              {t}
              {t === 'Fans' && game.fandom.demands.length > 0 ? ' •' : ''}
            </button>
          ))}
          <button className="tab collapse" onClick={() => setPanelOpen(!panelOpen)} aria-label="Toggle panel">
            {panelOpen ? '›' : '‹'}
          </button>
        </nav>
        {panelOpen && (
          <div className="panel-scroll">
            {tab === 'Project' && <ProjectPanel game={game} act={g.act} />}
            {tab === 'Team' && <TeamPanel game={game} act={g.act} focusName={person?.name ?? null} />}
            {tab === 'Research' && <ResearchPanel game={game} act={g.act} />}
            {tab === 'Business' && <BusinessPanel game={game} act={g.act} />}
            {tab === 'Fans' && <FansPanel game={game} />}
            {tab === 'Rivals' && <RivalsPanel game={game} />}
            {tab === 'Games' && <ReleasesPanel game={game} onOpen={(id) => g.setReleaseView(id)} />}
            {tab === 'Log' && <LogPanel game={game} />}
          </div>
        )}
      </aside>

      <section className="card log">
        {game.log.slice(-3).reverse().map((entry, i) => (
          <p key={`${entry.week}-${i}`} className={`log-${entry.tone ?? 'plain'}`}>
            {entry.text}
          </p>
        ))}
      </section>

      {selectedLine && <div className="card selected">{selectedLine}</div>}
      <Tutorial game={game} />
      {g.error && <div className="toast">{g.error}</div>}

      {g.releaseView && <ReleaseDay game={game} releaseId={g.releaseView} onClose={() => g.setReleaseView(null)} />}
      {!g.releaseView && event && <EventModal event={event} onChoose={g.choose} />}
      {!g.releaseView && !event && game.ending && (
        <EndingScreen
          game={game}
          onRestart={() => {
            g.quit()
            setScreen('setup')
          }}
        />
      )}
    </div>
  )
}
