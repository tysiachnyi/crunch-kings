import { Bloom, EffectComposer, N8AO, TiltShift2, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'

export function OfficePostFx() {
  return (
    <EffectComposer multisampling={4}>
      <N8AO aoRadius={0.6} intensity={2.5} distanceFalloff={0.6} color="#2B2540" />
      <Bloom luminanceThreshold={1} intensity={0.6} mipmapBlur />
      <TiltShift2 blur={0.08} />
      <Vignette offset={0.3} darkness={0.5} />
      <ToneMapping mode={ToneMappingMode.AGX} />
    </EffectComposer>
  )
}
