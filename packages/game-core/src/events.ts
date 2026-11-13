import {
  ABSORB_MONEY,
  ABSORB_STAFF_LOSS,
  EVENTS_PER_YEAR,
  FAN_PETITION_FULFIL,
  FAN_PETITION_FULFIL_COST,
  FAN_PETITION_IGNORE,
  JAM_FANS,
  JAM_HYPE,
  MORALE_START,
  RESCUE_LOAN,
  RESCUE_LOAN_INTEREST,
  RESCUE_LOAN_WEEKS,
  RESCUE_NEGATIVE_WEEKS,
} from './balance'
import { dateLabel, weekOfYear, yearOf } from './calendar'
import { FIRST_NAMES, GENRES, LAST_NAMES, SKILLS, TOPICS } from './content'
import type { Rng } from './rng'
import { averageSkill, capacity, shiftMorale } from './staff'
import type { Employee, GameState, Genre, PendingEvent, Topic } from './types'
import { clamp, inflation, log, money } from './util'

function queue(state: GameState, event: PendingEvent): GameState {
  return { ...state, pendingEvents: [...state.pendingEvents, event] }
}

function fired(state: GameState, id: string): GameState {
  return { ...state, firedEvents: { ...state.firedEvents, [id]: state.week } }
}

function cooledDown(state: GameState, id: string, weeks: number): boolean {
  const last = state.firedEvents[id]
  return last === undefined || state.week - last >= weeks
}

function friend(state: GameState): Employee | undefined {
  return state.staff.find((e) => e.kind === 'friend')
}

function delayProject(state: GameState, weeks: number): GameState {
  if (!state.project) return state
  return { ...state, project: { ...state.project, weeksLeft: state.project.weeksLeft + weeks, totalWeeks: state.project.totalWeeks + weeks } }
}

type RandomEvent = {
  id: string
  cooldown: number
  when: (s: GameState) => boolean
  run: (s: GameState, rng: Rng) => GameState
}

const lastRelease = (s: GameState) => s.releases.at(-1)

const RANDOM_EVENTS: RandomEvent[] = [
  {
    id: 'piracy',
    cooldown: 104,
    when: (s) => yearOf(s.week) <= 1995 && s.releases.some((r) => r.onSaleWeeks < r.weeklySales.length),
    run: (s) =>
      queue(s, {
        id: 'piracy',
        title: 'Pirate copies',
        text: 'Kids in the schoolyard swap tapes of your game. Copy protection costs money. Or you can let it go.',
        choices: [
          { id: 'protect', label: `Buy copy protection (${money(2000 * inflation(s.week))})` },
          { id: 'ignore', label: 'Let it go (sales -5% for a year)' },
        ],
      }),
  },
  {
    id: 'powerOutage',
    cooldown: 52,
    when: (s) => s.office === 'garage' && s.project !== null,
    run: (s) => log(delayProject(s, 1), 'Power outage in the garage. A week of work vanishes into the dark.', 'bad'),
  },
  {
    id: 'magazine',
    cooldown: 26,
    when: (s) => (lastRelease(s)?.score ?? 0) >= 7 && s.week - (lastRelease(s)?.week ?? 0) < 10,
    run: (s) => log({ ...s, hype: Math.min(100, s.hype + 15) }, `Byte Herald prints a two-page story about ${s.studioName}. Hype +15.`, 'good'),
  },
  {
    id: 'expo',
    cooldown: 52,
    when: (s) => yearOf(s.week) >= 1985,
    run: (s) =>
      queue(s, {
        id: 'expo',
        title: 'Expo invitation',
        text: 'The Home Computer Expo offers you a booth. Big crowds, small booth, loud music.',
        choices: [
          { id: 'go', label: `Rent a booth (${money(3000 * inflation(s.week))}, hype +20)` },
          { id: 'skip', label: 'Stay home' },
        ],
      }),
  },
  {
    id: 'poach',
    cooldown: 52,
    when: (s) => s.rivals.some((r) => r.alive && r.openYear <= yearOf(s.week)) && s.staff.some((e) => e.kind === 'hire' && !e.traits.includes('loyal') && averageSkill(e.skills) > 6),
    run: (s, rng) => {
      const targets = s.staff.filter((e) => e.kind === 'hire' && !e.traits.includes('loyal') && averageSkill(e.skills) > 6)
      const target = rng.pick(targets)
      const rival = rng.pick(s.rivals.filter((r) => r.alive && r.openYear <= yearOf(s.week)))
      return queue(s, {
        id: 'poach',
        title: 'A rival calls',
        text: `${rival.name} offers ${target.name} a better job. ${target.name} looks at you and waits.`,
        choices: [
          { id: 'raise', label: `Give a 15% raise (+${money(target.salary * 0.15)}/month)` },
          { id: 'let', label: 'Wish them luck' },
        ],
        data: { employee: target.id, rival: rival.name },
      })
    },
  },
  {
    id: 'trend',
    cooldown: 52,
    when: () => true,
    run: (s, rng) => {
      const year = yearOf(s.week)
      const genres = (Object.keys(GENRES) as Genre[]).filter((g) => GENRES[g].year <= year)
      const topics = (Object.keys(TOPICS) as Topic[]).filter((t) => TOPICS[t].year <= year)
      const bonus = rng.int(3, 6)
      if (rng.chance(0.5)) {
        const genre = rng.pick(genres)
        return log({ ...s, modifiers: [...s.modifiers, { id: 'trend', label: `${GENRES[genre].label} is hot`, weeksLeft: 52, quality: bonus, genre }] }, `Hot trend: everybody wants ${GENRES[genre].label} games this year. Quality +${bonus}.`, 'good')
      }
      const topic = rng.pick(topics)
      return log({ ...s, modifiers: [...s.modifiers, { id: 'trend', label: `${TOPICS[topic].label} is hot`, weeksLeft: 52, quality: bonus, topic }] }, `Hot trend: ${TOPICS[topic].label} is everywhere. Lunch boxes, cartoons, cereal. Quality +${bonus}.`, 'good')
    },
  },
  {
    id: 'viral',
    cooldown: 52,
    when: (s) => (lastRelease(s)?.score ?? 0) >= 6 && s.week - (lastRelease(s)?.week ?? 0) < 4,
    run: (s) => log({ ...s, modifiers: [...s.modifiers, { id: 'viral', label: 'TV spot', weeksLeft: 4, sales: 1.2 }] }, `A kids TV show plays your game on air. Sales +20% for 4 weeks.`, 'good'),
  },
  {
    id: 'badStorm',
    cooldown: 52,
    when: (s) => (lastRelease(s)?.score ?? 10) < 4 && s.week - (lastRelease(s)?.week ?? 0) < 6,
    run: (s) => log({ ...s, fans: Math.round(s.fans * 0.9) }, 'A storm of bad word of mouth. 10% of your fans quietly leave.', 'bad'),
  },
  {
    id: 'flood',
    cooldown: 104,
    when: (s) => s.office === 'garage' || s.office === 'smallOffice',
    run: (s) =>
      queue(s, {
        id: 'flood',
        title: 'Water on the floor',
        text: 'A pipe bursts. The floppy disks float like little boats.',
        choices: [
          { id: 'pay', label: `Call a plumber now (${money(1500 * inflation(s.week))})` },
          { id: 'wait', label: 'Mop it up yourselves (lose 2 weeks)' },
        ],
      }),
  },
  {
    id: 'visit',
    cooldown: 52,
    when: (s) => s.fans > 1000,
    run: (s) => log({ ...s, hype: Math.min(100, s.hype + 12) }, 'A school class visits the studio. The photo makes the local paper. Hype +12.', 'good'),
  },
  {
    id: 'intern',
    cooldown: 156,
    when: (s) => s.staff.length < capacity(s),
    run: (s, rng) => {
      const skills = { design: 3, tech: 3, art: 3, sound: 3, story: 3, polish: 3 }
      const strong = rng.pick(SKILLS)
      skills[strong] += 4
      const intern: Employee = {
        id: `emp-${s.nextId}`,
        name: `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`,
        role: strong === 'tech' ? 'coder' : strong === 'art' ? 'artist' : strong === 'sound' ? 'sound' : strong === 'story' ? 'writer' : 'designer',
        kind: 'hire',
        skills,
        salary: Math.round(400 * inflation(s.week)),
        traits: ['fastLearner'],
        morale: MORALE_START + 10,
        stress: 0,
        burnoutWeeks: 0,
        lowMoraleWeeks: 0,
        hiredWeek: s.week,
      }
      return log({ ...s, nextId: s.nextId + 1, staff: [...s.staff, intern] }, `A lucky intern walks in: ${intern.name}, great at ${strong}, asks only for pizza and ${money(intern.salary)} a month.`, 'good')
    },
  },
  {
    id: 'coffee',
    cooldown: 52,
    when: () => true,
    run: (s) => log(shiftMorale(s, 3), 'Someone finds a coffee machine at a garage sale. It makes one sound: GRRRK. Morale +3.', 'good'),
  },
  {
    id: 'engineBug',
    cooldown: 52,
    when: (s) => s.project?.engine === 'own',
    run: (s) => (s.project ? log({ ...s, project: { ...s.project, bugs: s.project.bugs + 6 } }, 'Your own engine has a bug that eats save files. Bugs +6.', 'bad') : s),
  },
]

function scheduled(state: GameState): GameState {
  let s = state
  const year = yearOf(s.week)
  const w = weekOfYear(s.week)
  const pal = friend(s)

  if (w === 1 && year > 1980) {
    s = log(shiftMorale(s, 3), `${s.studioName} turns ${year - 1980}! Cake in the ${s.office === 'garage' ? 'garage' : 'office'}.${pal ? ` ${pal.name} gives a speech that nobody asked for.` : ''}`, 'story')
  }
  if (s.week === 10 && pal) {
    const lines: Record<string, string> = {
      'Maggie Lee': 'Maggie draws the studio logo on a napkin. She starts a secret studio diary the same night.',
      'Danny Cobb': 'Danny says "five more minutes" at 9 PM. You find him asleep on the keyboard at noon.',
      'Roy Pak': 'Roy records a drum loop on your kitchen pots. Your neighbor does not like it.',
    }
    s = log(s, lines[pal.name] ?? `${pal.name} brings a lamp from home. The garage feels like a studio now.`, 'story')
  }
  if (year === 1983 && w === 10) {
    s = log({ ...s, modifiers: [...s.modifiers, { id: 'crash', label: 'Market crash', weeksLeft: 8, sales: 0.75 }] }, 'MARKET CRASH. Shops return boxes of bad games. Everybody sells 25% less for 8 weeks.', 'bad')
  }
  if (year === 1985 && w === 1) {
    s = queue(s, {
      id: 'chapter2',
      title: 'Chapter 2: The Cartridge Boom',
      text: 'The Funbox console arrives in every toy shop. New genres appear: Racing, Shooter, Adventure, RPG. A devkit license costs $15,000. The garage years are over. Time to grow up, a little.',
      choices: [{ id: 'ok', label: 'Let us boom' }],
    })
  }
  if (year === 1989 && w === 40) {
    s = log(s, 'News: a new studio called Giga Gorilla registers its name. Their mascot is a gorilla who wears sunglasses indoors.', 'rival')
  }
  if (w === 20 && year > 1980) {
    s = queue(s, {
      id: 'jam',
      title: `Game Jam ${year}`,
      text: 'The city game jam is this weekend. 48 hours, one theme, free cola. Rival studios will be there.',
      choices: [
        { id: 'enter', label: 'Enter the jam (the project slips 1 week)' },
        { id: 'skip', label: 'Skip it' },
      ],
    })
  }
  return s
}

function rescueLadder(state: GameState): GameState {
  let s = state
  s = { ...s, negativeWeeks: s.money < 0 ? s.negativeWeeks + 1 : 0 }
  if (s.loan) {
    const loan = { ...s.loan, weeksLeft: s.loan.weeksLeft - 1 }
    s = { ...s, money: s.money - loan.weeklyPayment, loan: loan.weeksLeft > 0 ? loan : null }
    if (loan.weeksLeft === 0) s = log(s, 'The rescue loan is paid off. Mr Hawk sends a card and a cookie.', 'good')
  }
  if (s.rescueStep === 0 && s.negativeWeeks >= RESCUE_NEGATIVE_WEEKS) {
    s = queue({ ...s, rescueStep: 1, negativeWeeks: 0 }, {
      id: 'hawkLoan',
      title: 'Mr Hawk from the bank',
      text: `Mr Hawk sits on your only chair. He brings bad news and cookies. "Your account is red, ${s.studioName}. I can offer a rescue loan of ${money(RESCUE_LOAN)}. It costs 20%, paid weekly for a year."`,
      choices: [
        { id: 'accept', label: 'Take the loan' },
        { id: 'decline', label: 'No thanks, we will manage' },
      ],
    })
  } else if (s.rescueStep === 1 && s.negativeWeeks >= RESCUE_NEGATIVE_WEEKS * 2) {
    const hires = s.staff.filter((e) => e.kind === 'hire')
    const lose = Math.ceil(hires.length * ABSORB_STAFF_LOSS)
    const gone = new Set(hires.slice(-lose).map((e) => e.id))
    s = { ...s, rescueStep: 2, negativeWeeks: 0, money: ABSORB_MONEY, staff: s.staff.filter((e) => !gone.has(e.id)) }
    s = queue(s, {
      id: 'absorbed',
      title: 'A publisher takes over',
      text: `A publisher buys your debts. ${lose > 0 ? `${lose} people lose their jobs.` : 'Nobody loses a job, but you lose your pride.'} You get ${money(ABSORB_MONEY)} and one last chance.`,
      choices: [{ id: 'ok', label: 'One last chance' }],
    })
  } else if (s.rescueStep === 2 && s.negativeWeeks >= RESCUE_NEGATIVE_WEEKS * 2) {
    s = log({ ...s, ending: 'bankrupt' }, `${dateLabel(s.week)}. ${s.studioName} closes. The garage door comes down for the last time.`, 'bad')
  }
  return s
}

export function weeklyEvents(state: GameState, rng: Rng): GameState {
  let s = scheduled(state)
  s = rescueLadder(s)
  if (rng.chance(EVENTS_PER_YEAR / 52)) {
    const options = RANDOM_EVENTS.filter((e) => cooledDown(s, e.id, e.cooldown) && e.when(s))
    if (options.length > 0) {
      const event = rng.pick(options)
      s = event.run(fired(s, event.id), rng)
    }
  }
  return s
}

export function resolveEvent(state: GameState, choiceId: string, rng: Rng): GameState {
  const [event, ...rest] = state.pendingEvents
  if (!event) return state
  let s: GameState = { ...state, pendingEvents: rest }
  const key = `${event.id}:${choiceId}`
  switch (key) {
    case 'piracy:protect':
      s = log({ ...s, money: s.money - Math.round(2000 * inflation(s.week)) }, 'Copy protection installed. The pirates sulk.')
      break
    case 'piracy:ignore':
      s = log({ ...s, modifiers: [...s.modifiers, { id: 'piracy', label: 'Pirates', weeksLeft: 52, sales: 0.95 }] }, 'You shrug. The tapes keep spinning. Sales -5% for a year.', 'bad')
      break
    case 'expo:go':
      s = log({ ...s, money: s.money - Math.round(3000 * inflation(s.week)), hype: Math.min(100, s.hype + 20) }, 'The booth is tiny, the line is long. Hype +20.', 'good')
      break
    case 'poach:raise': {
      const id = String(event.data?.employee)
      s = { ...s, staff: s.staff.map((e) => (e.id === id ? { ...e, salary: Math.round(e.salary * 1.15), morale: clamp(e.morale + 5, 0, 100) } : e)) }
      s = log(s, 'The raise works. They stay, and they smile more.', 'good')
      break
    }
    case 'poach:let': {
      const id = String(event.data?.employee)
      const name = s.staff.find((e) => e.id === id)?.name ?? 'Someone'
      s = log({ ...s, staff: s.staff.filter((e) => e.id !== id) }, `${name} leaves for ${String(event.data?.rival)}. The desk stays empty.`, 'bad')
      break
    }
    case 'flood:pay':
      s = log({ ...s, money: s.money - Math.round(1500 * inflation(s.week)) }, 'The plumber fixes it and eats your last donut.')
      break
    case 'flood:wait':
      s = log(delayProject(s, 2), 'Two weeks of mopping. The project slips.', 'bad')
      break
    case 'petition:fulfil': {
      const demand = String(event.data?.demand)
      s = {
        ...s,
        money: s.money - FAN_PETITION_FULFIL_COST,
        fandom: { ...s.fandom, mood: clamp(s.fandom.mood + FAN_PETITION_FULFIL, 0, 100), demands: s.fandom.demands.map((d) => (d.id === demand ? { ...d, openedWeek: s.week } : d)) },
      }
      s = log(s, `Free update: "${String(event.data?.ask)}". The fans cheer. Mood +${FAN_PETITION_FULFIL}.`, 'fan')
      break
    }
    case 'petition:ignore':
      s = log({ ...s, fandom: { ...s.fandom, mood: clamp(s.fandom.mood + FAN_PETITION_IGNORE, 0, 100) } }, `The petition goes into a drawer. Fans notice. Mood ${FAN_PETITION_IGNORE}.`, 'fan')
      break
    case 'jam:enter': {
      const best = Math.max(...s.staff.map((e) => averageSkill(e.skills)))
      const win = rng.chance(clamp(0.15 + best / 25, 0.15, 0.7))
      s = delayProject(s, 1)
      if (win) {
        const fans = Math.round(JAM_FANS * (1 + (yearOf(s.week) - 1980) / 3))
        s = log(shiftMorale({ ...s, fans: s.fans + fans, hype: Math.min(100, s.hype + JAM_HYPE) }, 3), `You win the game jam! The trophy is a golden floppy disk. Fans +${fans}, hype +${JAM_HYPE}.`, 'good')
      } else {
        s = log(shiftMorale(s, 1), 'You take 4th place at the game jam. The judges liked the title screen.', undefined)
      }
      break
    }
    case 'hawkLoan:accept': {
      const total = RESCUE_LOAN * (1 + RESCUE_LOAN_INTEREST)
      s = log({ ...s, money: s.money + RESCUE_LOAN, loan: { amount: RESCUE_LOAN, weeklyPayment: Math.round(total / RESCUE_LOAN_WEEKS), weeksLeft: RESCUE_LOAN_WEEKS } }, `Rescue loan: +${money(RESCUE_LOAN)}. Mr Hawk leaves the cookies.`, 'story')
      break
    }
    case 'hawkLoan:decline':
      s = log(s, 'Mr Hawk nods slowly and takes the cookies back.', 'story')
      break
    default:
      break
  }
  return s
}

export function storyOnRelease(state: GameState): GameState {
  let s = state
  const release = s.releases.at(-1)
  if (!release) return s
  if (s.releases.length === 1) {
    s = log(s, 'Your first game is out. Your mom buys three copies. Contracts are open now: other companies want your help.', 'story')
  }
  if (release.score < 4 && !s.milestones.includes('momCalled')) {
    s = { ...s, milestones: [...s.milestones, 'momCalled'] }
    s = log(shiftMorale(s, 4), 'Mom calls: "I played it, honey. The music is nice." Founder morale +4.', 'story')
  }
  if (release.score >= 8 && !s.milestones.includes('firstHit')) {
    s = { ...s, milestones: [...s.milestones, 'firstHit'] }
    s = log(s, `"${release.title}" is your first hit. People call the garage asking for autographs.`, 'story')
  }
  return s
}
