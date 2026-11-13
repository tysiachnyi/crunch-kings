import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: '../../assets/public',
  resolve: {
    dedupe: ['react', 'react-dom', 'three', '@react-three/fiber'],
  },
})
