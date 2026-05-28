import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/freeDeck': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/player': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
          if (req.headers.accept?.indexOf('html') !== -1) {
            return '/index.html';
          }
        }
      },
      '/clan': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
          if (req.headers.accept?.indexOf('html') !== -1) {
            return '/index.html';
          }
        }
      },
      '/clans': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
          if (req.headers.accept?.indexOf('html') !== -1) {
            return '/index.html';
          }
        }
      },
      '/cards': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/decks': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/feedback': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
