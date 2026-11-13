import { useThree } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'

const VIEW_WIDTH_METERS = 8.4
const TARGET: [number, number, number] = [0, 1.2, 0]

export function OfficeCamera() {
  const { size } = useThree()
  const zoom = Math.min(size.width, size.height * (4 / 3)) / VIEW_WIDTH_METERS
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
