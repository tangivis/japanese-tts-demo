import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 6060,
    host: true
  },
  build: {
    outDir: 'dist'
  }
})