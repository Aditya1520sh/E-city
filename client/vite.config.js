import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Default Vite behavior: read env from project root (`client/.env*`) and Vercel env
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'axios'],
          ui: ['lucide-react', 'framer-motion'],
          charts: ['recharts'],
          maps: ['leaflet', 'react-leaflet']
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    }
  },
  // Dev server
  server: {
    port: 5173,
    strictPort: false,
    host: true
  },
  // Preview server
  preview: {
    port: 4173,
    strictPort: false,
    host: true
  }
})
