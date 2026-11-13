import { useEffect, useRef, useState } from 'react'
import { REGIONS, isOnSale, regionalSales, salesView } from '@crunch-kings/game-core'
import type { GameState, RegionId, Release, SalesBadge } from '@crunch-kings/game-core'
import { count, money } from '../format'
import { play } from '../sound'

const EXTRA_ROWS = 3
const BADGE_FIRST_DAY = 2

function CountUp({ value, ms }: { value: number; ms: number }) {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    const start = performance.now()
    const begin = from.current
    let timer: ReturnType<typeof setInterval> | undefined
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / ms)
      const v = begin + (value - begin) * (1 - (1 - t) ** 3)
      from.current = v
      setShown(v)
      if (t >= 1 && timer) clearInterval(timer)
    }
    timer = setInterval(tick, 30)
    tick()
    return () => clearInterval(timer)
  }, [value, ms])
  return <>{count(shown)}</>
}

function shownBadges(release: Release, week: number, days: number): SalesBadge[] {
  let rank = 0
  return release.badges.filter((b) => b.week < week || BADGE_FIRST_DAY + rank++ <= days)
}

export function Badges({ badges, fresh }: { badges: SalesBadge[]; fresh?: Set<string> }) {
  if (badges.length === 0) return null
  return (
    <ul className="stamps" aria-label="Sales badges">
      {badges.map((b) => (
        <li key={b.id} className={`stamp ${fresh?.has(b.id) ? 'fresh' : ''}`}>
          {b.label}
        </li>
      ))}
    </ul>
  )
}

export function RegionBars({ release }: { release: Release }) {
  const split = regionalSales(release)
  const rows = (Object.keys(split) as RegionId[]).sort((a, b) => split[b] - split[a])
  const peak = Math.max(1, ...rows.map((id) => split[id]))
  return (
    <div className="regions" role="group" aria-label="Sales by region">
      {rows.map((id) => (
        <div key={id} className="region-row">
          <span>{REGIONS[id].short}</span>
          <span className="region-track">
            <i style={{ width: `${(split[id] / peak) * 100}%` }} />
          </span>
          <span className="num">{count(split[id])}</span>
        </div>
      ))}
    </div>
  )
}

export function SalesDesk({ game, days, stepMs, onOpen }: { game: GameState; days: number; stepMs: number; onOpen: (id: string) => void }) {
  const tween = Math.min(260, stepMs * 0.8)
  const onSale = game.releases.filter((r) => isOnSale(game, r))
  const main = onSale[onSale.length - 1]
  const badges = main ? shownBadges(main, game.week, days) : []
  const keyOf = (b: SalesBadge) => `${main?.id}:${b.id}`
  const initial = useRef<Set<string> | null>(null)
  if (initial.current === null) initial.current = new Set(badges.map(keyOf))
  const last = useRef({ id: main?.id, n: badges.length })
  useEffect(() => {
    if (last.current.id === main?.id && badges.length > last.current.n) play('stamp')
    last.current = { id: main?.id, n: badges.length }
  }, [main?.id, badges.length])

  if (!main) return null
  const index = game.week - main.week
  const view = salesView(main, index, days)
  const before = view.series[view.series.length - 2]
  const change = before !== undefined && before >= 10 ? Math.round((view.today / before - 1) * 100) : null
  const peak = Math.max(1, ...view.series)
  const fresh = new Set(badges.filter((b) => !initial.current?.has(keyOf(b))).map((b) => b.id))
  const others = onSale.slice(0, -1).reverse()
  return (
    <section className="desk" aria-label="Sales desk">
      <div className="desk-head">
        <p className="kicker">Sales desk</p>
        <p className="kicker desk-day">Day {view.day} on sale</p>
      </div>
      <button className="desk-title" onClick={() => onOpen(main.id)} title="Open the release day">
        {main.title}
      </button>
      <div className="desk-today">
        <span className="desk-big">
          <CountUp value={view.today} ms={tween} />
        </span>
        <span className="desk-label">
          sold today
          {change !== null && <b className={change >= 0 ? 'good' : 'bad'}> {change >= 0 ? '+' : ''}{change}%</b>}
        </span>
      </div>
      <div className="desk-bars" role="img" aria-label="Copies sold per day, last 28 days">
        {view.series.map((v, i) => (
          <i key={view.day - view.series.length + i + 1} className={i === view.series.length - 1 ? 'new' : undefined} style={{ height: `${Math.max(5, (v / peak) * 100)}%` }} />
        ))}
      </div>
      <dl className="desk-totals">
        <div>
          <dt>Total copies</dt>
          <dd>
            <CountUp value={view.total} ms={tween} />
          </dd>
        </div>
        <div>
          <dt>Revenue</dt>
          <dd>{money(view.revenue)}</dd>
        </div>
      </dl>
      <Badges badges={badges} fresh={fresh} />
      {others.length > 0 && (
        <div className="desk-others">
          <p className="kicker">Also selling</p>
          {others.slice(0, EXTRA_ROWS).map((r) => {
            const v = salesView(r, game.week - r.week, days, 1)
            return (
              <button key={r.id} className="desk-row" onClick={() => onOpen(r.id)}>
                <span className="desk-row-title">{r.title}</span>
                <span className="num">{count(v.today)} today</span>
                <span className="num muted">{count(v.total)}</span>
              </button>
            )
          })}
          {others.length > EXTRA_ROWS && <p className="small muted">and {others.length - EXTRA_ROWS} more</p>}
        </div>
      )}
      <button className="desk-compact" onClick={() => onOpen(main.id)} aria-label={`${main.title}: ${count(view.today)} today, ${count(view.total)} total`}>
        <span className="desk-row-title">{main.title}</span>
        <span className="num">{count(view.today)} today</span>
        <span className="num muted">{count(view.total)}</span>
      </button>
    </section>
  )
}
