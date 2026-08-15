import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    // Raise warning threshold slightly — we're actively splitting below
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — cached long-term, rarely changes
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Data fetching / state
          'vendor-query': ['@tanstack/react-query'],
          // Charts library — large, isolate it
          'vendor-charts': ['recharts'],
          // Animation library
          'vendor-motion': ['framer-motion'],
          // Date utility
          'vendor-date': ['date-fns'],
          // Toast notifications
          'vendor-toast': ['react-hot-toast'],
        },
      },
    },
  },
})
