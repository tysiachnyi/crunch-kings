import { useEffect, useMemo, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import type { Mesh, Object3D } from 'three'

export const STAGE_MODEL_URL = '/models/stage1.glb'

const SELECTABLE_PREFIXES = ['Dev_', 'Desk_', 'Chair_', 'Cooler_', 'Plant_', 'Shelf_', 'Pizza_', 'Box_', 'Bin_']

function findSelectable(object: Object3D | null): Object3D | null {
  for (let node = object; node; node = node.parent) {
    if (SELECTABLE_PREFIXES.some((prefix) => node!.name.startsWith(prefix)) && /_\d+$/.test(node.name)) {
      return node
    }
  }
  return null
}

type StageProps = {
  onSelect: (name: string | null) => void
}

export function Stage({ onSelect }: StageProps) {
  const { scene } = useGLTF(STAGE_MODEL_URL)
  const [hovered, setHovered] = useState<Object3D | null>(null)

  useMemo(() => {
    scene.traverse((child) => {
      const mesh = child as Mesh
      if (mesh.isMesh) {
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
  }, [scene])

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'default'
    if (!hovered) return
    hovered.scale.setScalar(1.04)
    return () => {
      hovered.scale.setScalar(1)
    }
  }, [hovered])

  return (
    <primitive
      object={scene}
      onPointerMove={(event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation()
        setHovered(findSelectable(event.object))
      }}
      onPointerOut={() => setHovered(null)}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation()
        onSelect(findSelectable(event.object)?.name ?? null)
      }}
    />
  )
}

useGLTF.preload(STAGE_MODEL_URL)
