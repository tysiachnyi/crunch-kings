import { useState } from 'react'
import { START_MONEY, createGarageFriend, money } from '@crunch-kings/game-core'
import type { Archetype, NewGameSetup } from '@crunch-kings/game-core'

const ARCHETYPES: { id: Archetype; label: string; pitch: string }[] = [
  { id: 'coder', label: 'Coder', pitch: 'Fast, clean tech. Bugs fear you.' },
  { id: 'designer', label: 'Designer', pitch: 'Ideas first. Fun is your engine.' },
  { id: 'artist', label: 'Artist', pitch: 'Your games look like nothing else.' },
]

type NewStudioProps = {
  onFound: (setup: Omit<NewGameSetup, 'seed'>) => void
  onBack?: () => void
}

export function NewStudio({ onFound, onBack }: NewStudioProps) {
  const [studioName, setStudioName] = useState('Garage Legends')
  const [founderName, setFounderName] = useState('')
  const [archetype, setArchetype] = useState<Archetype>('coder')
  const friend = createGarageFriend(archetype)

  return (
    <form
      className="card setup"
      onSubmit={(event) => {
        event.preventDefault()
        onFound({ studioName: studioName.trim() || 'Garage Legends', founderName, archetype })
      }}
    >
      <h1>Crunch Kings</h1>
      <p className="tagline">January 1980. A garage, a used computer and {money(START_MONEY)} from selling your car.</p>
      <label>
        Studio name
        <input value={studioName} onChange={(e) => setStudioName(e.target.value)} maxLength={32} />
      </label>
      <label>
        Your name
        <input value={founderName} onChange={(e) => setFounderName(e.target.value)} placeholder="You" maxLength={24} />
      </label>
      <fieldset>
        <legend>You are a...</legend>
        {ARCHETYPES.map((a) => (
          <label key={a.id} className={`choice ${archetype === a.id ? 'active' : ''}`}>
            <input type="radio" name="archetype" checked={archetype === a.id} onChange={() => setArchetype(a.id)} />
            <strong>{a.label}</strong>
            <span>{a.pitch}</span>
          </label>
        ))}
      </fieldset>
      <p className="friend">
        Your garage friend: <strong>{friend.name}</strong> ({friend.role})
      </p>
      <button type="submit">Open the garage</button>
      {onBack && (
        <button type="button" className="link" onClick={onBack}>
          Back
        </button>
      )}
    </form>
  )
}
