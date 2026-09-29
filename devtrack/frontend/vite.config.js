import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// In dev, when VITE_API_URL is empty, /api and /health are proxied to the backend.
const proxyTarget = process.env.DEV_API_PROXY || 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': proxyTarget, '/health': proxyTarget },
  },
  test: { environment: 'node' },
})
