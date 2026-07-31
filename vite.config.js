import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    allowedHosts: [
      "penological-literalistic-inger.ngrok-free.dev"
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8570',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
