import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Middleware plugin to support clean /admin URL in local dev & preview mode matching Vercel
function adminRewritePlugin() {
  return {
    name: 'admin-rewrite-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/admin' || req.url.startsWith('/admin?')) {
          req.url = '/admin.html' + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '')
        }
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/admin' || req.url.startsWith('/admin?')) {
          req.url = '/admin.html' + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '')
        }
        next()
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), adminRewritePlugin()],
  server: {
    port: 3000,
    open: false
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html')
      }
    }
  }
})
