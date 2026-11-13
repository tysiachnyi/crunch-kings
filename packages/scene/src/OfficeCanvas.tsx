import { Suspense, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { NoToneMapping } from 'three'
import { OfficeCamera } from './OfficeCamera'
import { OfficeLights } from './OfficeLights'
import { OfficePostFx } from './OfficePostFx'
import { Stage } from './Stage'

export const BACKDROP_COLOR = '#1C1A26'

type OfficeCanvasProps = {
  onSelect?: (name: string | null) => void
  camera?: ReactNode
  children?: ReactNode
}

export function OfficeCanvas({ onSelect, camera, children }: OfficeCanvasProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: false, toneMapping: NoToneMapping }}
      onPointerMissed={() => onSelect?.(null)}
    >
      <color attach="background" args={[BACKDROP_COLOR]} />
      {camera ?? <OfficeCamera />}
      <OfficeLights />
      <Suspense fallback={null}>
        <Stage onSelect={onSelect ?? (() => {})} />
      </Suspense>
      {children}
      <OfficePostFx />
    </Canvas>
  )
}
