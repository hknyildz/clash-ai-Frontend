import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// https://api.clashdeckster.com
// http://localhost:8080
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/freeDeck': {
        target: 'https://api.clashdeckster.com',
        changeOrigin: true,
        secure: false,
      },
      '/player': {
        target: 'https://api.clashdeckster.com',
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
          if (req.headers.accept?.indexOf('html') !== -1) {
            return '/index.html';
          }
        }
      },
      '/clan': {
        target: 'https://api.clashdeckster.com',
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
          if (req.headers.accept?.indexOf('html') !== -1) {
            return '/index.html';
          }
        }
      },
      '/clans': {
        target: 'https://api.clashdeckster.com',
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
          if (req.headers.accept?.indexOf('html') !== -1) {
            return '/index.html';
          }
        }
      },
      '/cards': {
        target: 'https://api.clashdeckster.com',
        changeOrigin: true,
        secure: false,
        // Bypass for SPA routes
        bypass: (req) => {
          if (req.headers.accept?.indexOf('html') !== -1) {
            return '/index.html';
          }
        }
      },
      '/meta': {
        target: 'https://api.clashdeckster.com',
        changeOrigin: true,
        secure: false,
      },
      '/decks': {
        target: 'https://api.clashdeckster.com',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'https://api.clashdeckster.com',
        changeOrigin: true,
        secure: false,
      },
      '/feedback': {
        target: 'https://api.clashdeckster.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
