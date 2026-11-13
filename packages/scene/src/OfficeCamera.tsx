import { useThree } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'

const TARGET: [number, number, number] = [0, 1.2, 0]

export function OfficeCamera({ viewWidth = 8.4 }: { viewWidth?: number }) {
  const { size } = useThree()
  const zoom = Math.min(size.width, size.height * (4 / 3)) / viewWidth
  return (
    <OrthographicCamera
      makeDefault
      position={[15.3, 13.7, 15.3]}
      zoom={zoom}
      near={0.1}
      far={100}
      onUpdate={(camera) => camera.lookAt(...TARGET)}
    />
  )
}
