import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/freeDeck': {
        target: 'https://api.clashdeckster.com/',
        //target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/player': {
        target: 'https://api.clashdeckster.com/',
        //target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/cards': {
        target: 'https://api.clashdeckster.com/',
        //target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/decks': {
        target: 'https://api.clashdeckster.com/',
        //target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
