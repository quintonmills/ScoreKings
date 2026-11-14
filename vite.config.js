import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://servercore-pjwe.onrender.com',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
})
