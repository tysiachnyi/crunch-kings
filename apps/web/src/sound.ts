export type SoundName = 'click' | 'coin' | 'payday' | 'fanfare' | 'review' | 'ding' | 'bad' | 'hire' | 'research' | 'stamp'

type Note = { freq: number; at: number; length: number; type?: OscillatorType; volume?: number; slide?: number }

const SOUNDS: Record<SoundName, Note[]> = {
  click: [{ freq: 880, at: 0, length: 0.04, type: 'square', volume: 0.08 }],
  coin: [
    { freq: 988, at: 0, length: 0.07, type: 'square', volume: 0.1 },
    { freq: 1319, at: 0.07, length: 0.18, type: 'square', volume: 0.1 },
  ],
  payday: [
    { freq: 330, at: 0, length: 0.08, type: 'triangle', volume: 0.15 },
    { freq: 262, at: 0.09, length: 0.14, type: 'triangle', volume: 0.15 },
  ],
  fanfare: [
    { freq: 523, at: 0, length: 0.12, type: 'square', volume: 0.1 },
    { freq: 659, at: 0.12, length: 0.12, type: 'square', volume: 0.1 },
    { freq: 784, at: 0.24, length: 0.12, type: 'square', volume: 0.1 },
    { freq: 1047, at: 0.36, length: 0.4, type: 'square', volume: 0.1 },
    { freq: 523, at: 0.36, length: 0.4, type: 'triangle', volume: 0.12 },
  ],
  review: [{ freq: 600, at: 0, length: 0.08, type: 'triangle', volume: 0.12, slide: 900 }],
  ding: [
    { freq: 1175, at: 0, length: 0.25, type: 'sine', volume: 0.12 },
    { freq: 1568, at: 0.05, length: 0.3, type: 'sine', volume: 0.08 },
  ],
  bad: [{ freq: 220, at: 0, length: 0.3, type: 'sawtooth', volume: 0.07, slide: 110 }],
  hire: [
    { freq: 659, at: 0, length: 0.08, type: 'square', volume: 0.08 },
    { freq: 880, at: 0.08, length: 0.16, type: 'square', volume: 0.08 },
  ],
  stamp: [
    { freq: 150, at: 0, length: 0.14, type: 'triangle', volume: 0.22, slide: 60 },
    { freq: 1319, at: 0.05, length: 0.08, type: 'square', volume: 0.07 },
    { freq: 1760, at: 0.11, length: 0.18, type: 'square', volume: 0.07 },
  ],
  research: [
    { freq: 440, at: 0, length: 0.06, type: 'square', volume: 0.07 },
    { freq: 554, at: 0.06, length: 0.06, type: 'square', volume: 0.07 },
    { freq: 659, at: 0.12, length: 0.06, type: 'square', volume: 0.07 },
    { freq: 880, at: 0.18, length: 0.2, type: 'square', volume: 0.07 },
  ],
}

const MUTE_KEY = 'crunch-kings/muted'
let context: AudioContext | null = null
let muted = readMuted()

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
}

export function isMuted(): boolean {
  return muted
}

export function setMuted(value: boolean) {
  muted = value
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0')
  } catch {
    return
  }
}

export function play(name: SoundName) {
  if (muted || typeof AudioContext === 'undefined') return
  context ??= new AudioContext()
  if (context.state === 'suspended') void context.resume()
  const now = context.currentTime
  for (const note of SOUNDS[name]) {
    const osc = context.createOscillator()
    const gain = context.createGain()
    osc.type = note.type ?? 'square'
    osc.frequency.setValueAtTime(note.freq, now + note.at)
    if (note.slide) osc.frequency.linearRampToValueAtTime(note.slide, now + note.at + note.length)
    gain.gain.setValueAtTime(note.volume ?? 0.1, now + note.at)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.at + note.length)
    osc.connect(gain).connect(context.destination)
    osc.start(now + note.at)
    osc.stop(now + note.at + note.length + 0.02)
  }
}
