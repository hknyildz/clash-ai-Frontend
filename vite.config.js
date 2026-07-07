import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// http://localhost:8080
// https://api.clashdeckster.com
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
        // /decks is also a SPA page route → serve index.html for document requests,
        // proxy XHR (POST /decks/complete) to the backend.
        bypass: (req) => {
          if (req.headers.accept?.indexOf('html') !== -1) {
            return '/index.html';
          }
        }
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
