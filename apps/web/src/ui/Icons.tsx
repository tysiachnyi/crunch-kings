const MOUTHS = [
  'M5.5 12.5 Q9 9 12.5 12.5',
  'M5.5 12 Q9 10.2 12.5 12',
  'M5.8 11.5 H12.2',
  'M5.5 10.8 Q9 13 12.5 10.8',
  'M5 10.2 Q9 14.8 13 10.2',
]

function moodLevel(mood: number): number {
  if (mood >= 80) return 4
  if (mood >= 60) return 3
  if (mood >= 40) return 2
  if (mood >= 25) return 1
  return 0
}

export function MoodFace({ mood, size = 18 }: { mood: number; size?: number }) {
  const level = moodLevel(mood)
  const angry = level <= 1
  return (
    <svg className="face" width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" role="img" aria-label={`Fan mood ${Math.round(mood)} of 100`}>
      <circle cx="9" cy="9" r="7.6" />
      {angry ? (
        <>
          <path d="M5 5.6 L7.6 6.8" />
          <path d="M13 5.6 L10.4 6.8" />
        </>
      ) : null}
      <circle cx="6.5" cy="7.6" r="0.6" fill="currentColor" />
      <circle cx="11.5" cy="7.6" r="0.6" fill="currentColor" />
      <path d={MOUTHS[level]} />
    </svg>
  )
}

export function PlayIcon() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden="true">
      <path d="M0 0 L10 6 L0 12 Z" />
    </svg>
  )
}

export function PauseIcon() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden="true">
      <rect width="3.5" height="12" />
      <rect x="6.5" width="3.5" height="12" />
    </svg>
  )
}
