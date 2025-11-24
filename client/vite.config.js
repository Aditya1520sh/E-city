import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file from private folder
  const env = loadEnv(mode, path.resolve(__dirname, '../private'), 'VITE_')
  
  return {
    envDir: '../private',
    envPrefix: 'VITE_',
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
  // Optimize dev server
  server: {
    port: 5173,
    strictPort: false,
    host: true
  },
  // Optimize preview
  preview: {
    port: 4173,
    strictPort: false,
    host: true
  }
}
})
