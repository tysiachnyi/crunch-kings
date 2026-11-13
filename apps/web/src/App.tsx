import { useEffect, useState } from 'react'
import { OfficeCanvas } from '@crunch-kings/scene'
import type { ScenePerson } from '@crunch-kings/scene'
import { dateLabel, isOnSale, money, weeklyIncome } from '@crunch-kings/game-core'
import type { GameState } from '@crunch-kings/game-core'
import { NewStudio } from './NewStudio'
import { count } from './format'
import { isMuted, play, setMuted } from './sound'
import { BusinessPanel, FansPanel, LogPanel, ReleasesPanel, ResearchPanel, RivalsPanel, TeamPanel } from './ui/Panels'
import { MoodFace, PauseIcon, PlayIcon } from './ui/Icons'
import { EndingScreen, EventModal, PhaseSheet, ReleaseDay } from './ui/Modals'
import { ProjectPanel } from './ui/ProjectPanel'
import { SalesDesk } from './ui/SalesDesk'
import { Tutorial, resetTutorial } from './ui/Tutorial'
import { SPEEDS, dayMs, hasSave, useGame } from './useGame'

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
    <div className="cover menu">
      <p className="kicker">Demo · the garage years, 1980-1989</p>
      <h1 className="logo">
        Crunch<span>Kings</span>
      </h1>
      <p className="tagline">Start in a garage. End in the history books.</p>
      <div className="menu-list">
        {canContinue && (
          <button onClick={onContinue} autoFocus>
            Continue
          </button>
        )}
        <button className={canContinue ? 'secondary' : ''} onClick={onNew}>
          New studio
        </button>
        <button className="secondary" onClick={() => setHelp(!help)} aria-expanded={help}>
          How to play
        </button>
      </div>
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
      <label className="toggle cover-foot">
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
        if (game.project?.awaitingPhase) return
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
        <div className="scene with-cover">
          <OfficeCanvas office={game?.office ?? 'garage'} people={game ? scenePeople(game) : undefined} working={false} />
        </div>
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
  const hasDesk = game.releases.some((r) => isOnSale(game, r))
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
      <div className={`scene ${panelOpen ? 'with-panel' : ''} ${hasDesk ? 'with-desk' : ''}`}>
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

      <header className="bar">
        <div className="bar-id">
          <strong className="studio">{game.studioName}</strong>
          <span className="date">{dateLabel(game.week)}</span>
        </div>
        <dl className="readouts">
          <div className="readout" title={`Weekly sales ${money(income)}`}>
            <dt>Cash</dt>
            <dd className={game.money < 0 ? 'bad' : undefined}>{money(game.money)}</dd>
          </div>
          <div className="readout" title={`Fan mood ${Math.round(game.fandom.mood)}/100`}>
            <dt>Fans</dt>
            <dd>
              <MoodFace mood={game.fandom.mood} size={16} /> {count(game.fans)}
            </dd>
          </div>
          <div className="readout" title="Studio hype">
            <dt>Hype</dt>
            <dd>{Math.round(game.hype)}</dd>
          </div>
          <div className="readout" title="Research points">
            <dt>Research</dt>
            <dd>{Math.floor(game.researchPoints)}</dd>
          </div>
        </dl>
        <div className="transport">
          <button onClick={() => g.setRunning(!g.running)} className={`play ${g.running ? 'running' : ''}`} aria-label={g.running ? 'Pause' : 'Play'}>
            {g.running ? <PauseIcon /> : <PlayIcon />}
            <span>{g.running ? 'Pause' : 'Play'}</span>
          </button>
          <div className="seg" role="group" aria-label="Speed">
            {SPEEDS.map((s) => (
              <button key={s} className={g.speed === s ? 'active' : ''} aria-pressed={g.speed === s} onClick={() => g.setSpeed(s)}>
                {s}x
              </button>
            ))}
          </div>
        </div>
        <button className="bar-menu" onClick={() => setScreen('menu')}>
          Menu
        </button>
      </header>

      <aside className={`binder ${panelOpen ? 'open' : ''}`}>
        {panelOpen && (
          <div className="sheet">
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
        <nav className="rail">
          {TABS.map((t) => (
            <button
              key={t}
              className={`tab ${tab === t ? 'active' : ''}`}
              onClick={() => {
                setPanelOpen(!(panelOpen && tab === t))
                setTab(t)
                play('click')
              }}
            >
              {t}
              {t === 'Fans' && game.fandom.demands.length > 0 && <span className="dot" aria-label="open demands" />}
            </button>
          ))}
          <button className="tab collapse" onClick={() => setPanelOpen(!panelOpen)} aria-label={panelOpen ? 'Close panel' : 'Open panel'}>
            {panelOpen ? '→' : '←'}
          </button>
        </nav>
      </aside>

      <section className="ticker" aria-label="Latest news">
        {game.log.slice(-3).reverse().map((entry, i) => (
          <p key={`${entry.week}-${i}`} className={`log-${entry.tone ?? 'plain'}`}>
            {entry.text}
          </p>
        ))}
      </section>

      {selectedLine && <div className="selected">{selectedLine}</div>}
      <div className="left-stack">
        <SalesDesk game={game} days={g.salesDays} stepMs={dayMs(g.speed)} onOpen={(id) => g.setReleaseView(id)} />
        <Tutorial game={game} />
      </div>
      {g.error && <div className="toast">{g.error}</div>}

      {g.releaseView && <ReleaseDay game={game} releaseId={g.releaseView} onClose={() => g.setReleaseView(null)} />}
      {!g.releaseView && event && <EventModal event={event} onChoose={g.choose} />}
      {!g.releaseView && !event && !game.ending && game.project?.awaitingPhase && (
        <PhaseSheet game={game} onDecide={g.decidePhase} />
      )}
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
