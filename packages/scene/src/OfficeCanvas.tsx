import { Suspense, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { NoToneMapping } from 'three'
import { OfficeCamera } from './OfficeCamera'
import { OfficeLights } from './OfficeLights'
import { OfficePostFx } from './OfficePostFx'
import { DEFAULT_PEOPLE, Stage } from './Stage'
import type { OfficeLevel, ScenePerson } from './Stage'

export const BACKDROP_COLOR = '#141925'

const VIEW_WIDTH: Record<OfficeLevel, number> = { garage: 8.4, smallOffice: 10.4 }

type OfficeCanvasProps = {
  office?: OfficeLevel
  people?: ScenePerson[]
  working?: boolean
  crunch?: boolean
  onSelect?: (name: string | null) => void
  camera?: ReactNode
  children?: ReactNode
}

export function OfficeCanvas({ office = 'garage', people = DEFAULT_PEOPLE, working = false, crunch = false, onSelect, camera, children }: OfficeCanvasProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: false, toneMapping: NoToneMapping }}
      onPointerMissed={() => onSelect?.(null)}
    >
      <color attach="background" args={[BACKDROP_COLOR]} />
      {camera ?? <OfficeCamera viewWidth={VIEW_WIDTH[office]} />}
      <OfficeLights office={office} />
      <Suspense fallback={null}>
        <Stage office={office} people={people} working={working} crunch={crunch} onSelect={onSelect ?? (() => {})} />
      </Suspense>
      {children}
      <OfficePostFx />
    </Canvas>
  )
}
