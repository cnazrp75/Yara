import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // relative base so the build works both on localhost and under /Yara/ on GitHub Pages
  base: './',
  plugins: [react()],
  server: { port: 5173, open: true },
})
