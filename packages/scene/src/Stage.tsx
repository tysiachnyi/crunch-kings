import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import type { Mesh, Object3D } from 'three'

export type OfficeLevel = 'garage' | 'smallOffice'

export type ScenePerson = {
  id: string
  name: string
  role: string
  kind: 'founder' | 'friend' | 'hire'
  burnout?: boolean
}

export const STAGE_MODEL_URLS: Record<OfficeLevel, string> = {
  garage: '/models/stage1.glb',
  smallOffice: '/models/stage2.glb',
}
export const STAGE_MODEL_URL = STAGE_MODEL_URLS.garage
export const CHARACTERS_MODEL_URL = '/models/characters.glb'

const SELECTABLE_PREFIXES = ['Dev_', 'Desk_', 'Chair_', 'Cooler_', 'Plant_', 'Shelf_', 'Pizza_', 'Box_', 'Bin_', 'Sofa_', 'Arcade_']

const FRIEND_LOOKS: Record<string, string> = { 'Maggie Lee': 'maggie', 'Danny Cobb': 'danny', 'Roy Pak': 'roy' }

export const DEFAULT_PEOPLE: ScenePerson[] = [
  { id: 'founder', name: 'You', role: 'coder', kind: 'founder' },
  { id: 'friend', name: 'Maggie Lee', role: 'artist', kind: 'friend' },
]

function hash(text: string): number {
  let h = 0
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) | 0
  return Math.abs(h)
}

export function lookFor(person: ScenePerson): string {
  if (person.kind === 'founder') return `founder_${person.role}`
  if (person.kind === 'friend') return FRIEND_LOOKS[person.name] ?? 'maggie'
  if (person.role === 'coder') return hash(person.id) % 2 ? 'hire_coder2' : 'hire_coder'
  return `hire_${person.role}`
}

function findSelectable(object: Object3D | null): Object3D | null {
  for (let node = object; node; node = node.parent) {
    if (SELECTABLE_PREFIXES.some((prefix) => node!.name.startsWith(prefix)) && /_\d+$/.test(node.name)) {
      return node
    }
  }
  return null
}

type Rig = { root: Object3D; head: Object3D | null; armL: Object3D | null; armR: Object3D | null; phase: number; burnout: boolean }

type StageProps = {
  office: OfficeLevel
  people: ScenePerson[]
  working: boolean
  crunch: boolean
  onSelect: (name: string | null) => void
}

export function Stage({ office, people, working, crunch, onSelect }: StageProps) {
  const { scene } = useGLTF(STAGE_MODEL_URLS[office])
  const { scene: cast } = useGLTF(CHARACTERS_MODEL_URL)
  const [hovered, setHovered] = useState<Object3D | null>(null)
  const rigs = useRef<Rig[]>([])

  useMemo(() => {
    for (const root of [scene, cast]) {
      root.traverse((child) => {
        const mesh = child as Mesh
        if (mesh.isMesh) {
          mesh.castShadow = true
          mesh.receiveShadow = true
        }
      })
    }
  }, [scene, cast])

  const key = people.map((p) => `${p.id}:${lookFor(p)}:${p.burnout ? 1 : 0}`).join('|')

  useEffect(() => {
    const added: Rig[] = []
    people.forEach((person, i) => {
      const seat = scene.getObjectByName(`Seat_${String(i + 1).padStart(2, '0')}`)
      const source = cast.getObjectByName(`Char_${lookFor(person)}`)
      if (!seat || !source) return
      const root = source.clone(true)
      root.name = `Dev_${String(i + 1).padStart(2, '0')}`
      root.position.set(0, 0, 0)
      root.userData.person = person.name
      seat.add(root)
      const base = `Char_${lookFor(person)}`
      added.push({
        root,
        head: root.getObjectByName(`${base}_Head`) ?? null,
        armL: root.getObjectByName(`${base}_ArmL`) ?? null,
        armR: root.getObjectByName(`${base}_ArmR`) ?? null,
        phase: i * 1.7,
        burnout: !!person.burnout,
      })
    })
    rigs.current = added
    return () => {
      for (const rig of added) rig.root.removeFromParent()
      rigs.current = []
    }
  }, [scene, cast, key])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const speed = crunch ? 2.2 : 1
    for (const rig of rigs.current) {
      const p = rig.phase
      const busy = working && !rig.burnout
      if (rig.head) {
        rig.head.rotation.x = rig.burnout ? 0.45 : busy ? Math.sin(t * 2.4 * speed + p) * 0.06 - 0.05 : Math.sin(t * 0.8 + p) * 0.04
        rig.head.rotation.y = busy ? Math.sin(t * 0.7 + p) * 0.08 : Math.sin(t * 0.4 + p) * 0.35
      }
      const tap = (offset: number) => (busy ? Math.max(0, Math.sin(t * 14 * speed + p + offset)) * 0.12 : 0)
      if (rig.armL) rig.armL.rotation.x = tap(0)
      if (rig.armR) rig.armR.rotation.x = tap(Math.PI / 2)
      rig.root.position.y = busy ? Math.abs(Math.sin(t * 2.4 * speed + p)) * 0.006 : Math.sin(t * 1.2 + p) * 0.004
    }
  })

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'default'
    if (!hovered) return
    const base = hovered.scale.x
    hovered.scale.setScalar(base * 1.04)
    return () => {
      hovered.scale.setScalar(base)
    }
  }, [hovered])

  return (
    <primitive
      object={scene}
      onPointerMove={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation()
        const next = findSelectable(event.object)
        setHovered((current) => (current === next ? current : next))
      }}
      onPointerOut={() => setHovered(null)}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation()
        onSelect(findSelectable(event.object)?.name ?? null)
      }}
    />
  )
}

useGLTF.preload(STAGE_MODEL_URLS.garage)
useGLTF.preload(CHARACTERS_MODEL_URL)
