import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    // Force .js to parse as JSX if you want, though not usually needed if plugin-react is installed
    loader: 'jsx',
  }
})
