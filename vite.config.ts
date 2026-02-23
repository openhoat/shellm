import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { version } from './package.json'

export default defineConfig(({ mode }) => ({
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
  },
  css: {
    devSourcemap: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@electron': path.resolve(__dirname, './electron'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: mode === 'development',
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore warnings about unresolved external dependencies
        if (warning.code === 'UNRESOLVED_IMPORT') {
          return
        }
        warn(warning)
      },
    },
  },
}))
