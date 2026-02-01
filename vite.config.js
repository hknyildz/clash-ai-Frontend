import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/freeDeck': {
        target: 'http://46.225.62.213',
        //target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/player': {
        target: 'http://46.225.62.213',
        //target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/cards': {
          target: 'http://46.225.62.213',
          //target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/decks': {
          target: 'http://46.225.62.213',
          //target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
