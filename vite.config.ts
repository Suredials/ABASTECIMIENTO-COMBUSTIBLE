import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api/anh': {
    target: 'https://vsr11vpr08m22gb.anh.gob.bo:9443', changeOrigin: true, secure: false,
    rewrite: (path) => path.replace(/^\/api\/anh/, '/WSMobile/v2'),
  } } },
})
