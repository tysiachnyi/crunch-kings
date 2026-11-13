export function OfficeLights() {
  return (
    <>
      <hemisphereLight args={['#FFE2C4', '#6A5C9A', 1.1]} />
      <directionalLight
        position={[3, 10, 2]}
        intensity={2.6}
        color="#FFD0A0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[8, 6, 8]} intensity={0.5} color="#BFCBFF" />
      <pointLight position={[0.25, 1.05, -1.17]} intensity={3} distance={3} color="#FFBF73" />
      <pointLight position={[-1.8, 1.05, -0.4]} intensity={1.5} distance={2} color="#80D9FF" />
      <pointLight position={[0.9, 1.05, -1.6]} intensity={1.5} distance={2} color="#80D9FF" />
    </>
  )
}
