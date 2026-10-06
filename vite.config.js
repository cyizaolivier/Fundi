import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' makes the build's asset paths relative, so the app works
// whether it's served from the domain root or a subfolder like
// http://localhost/fundilink-react/ under Apache.
export default defineConfig({
  plugins: [react()],
  base: './',
})
