import { useState } from 'react'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { OfficeCanvas } from '@crunch-kings/scene'

export function App() {
  const [selected, setSelected] = useState<string | null>(null)
  const [orbit, setOrbit] = useState(false)

  return (
    <>
      <OfficeCanvas
        onSelect={setSelected}
        camera={orbit ? <PerspectiveCamera makeDefault position={[7, 6, 7]} fov={40} /> : undefined}
      >
        {orbit && <OrbitControls target={[0, 1, 0]} makeDefault />}
      </OfficeCanvas>
      <div className="panel">
        <strong>Scene viewer</strong>
        <label>
          <input type="checkbox" checked={orbit} onChange={(e) => setOrbit(e.target.checked)} /> Free camera
        </label>
        <span>Selected: {selected ?? '-'}</span>
      </div>
    </>
  )
}
