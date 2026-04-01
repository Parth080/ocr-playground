import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const target = env.VITE_MODAL_URL || ''
  const modalKey = env.MODAL_KEY || ''
  const modalSecret = env.MODAL_SECRET || ''

  console.log(`[vite] Proxy target: ${target || '(not set)'}`)
  console.log(`[vite] Auth: ${modalKey && modalSecret ? 'yes (Modal-Key + Modal-Secret)' : 'NO — set MODAL_KEY and MODAL_SECRET in .env'}`)

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: target
        ? {
            '/api': {
              target,
              changeOrigin: true,
              secure: true,
              rewrite: (path) => path.replace(/^\/api/, ''),
              configure: (proxy) => {
                proxy.on('proxyReq', (proxyReq) => {
                  if (modalKey) proxyReq.setHeader('Modal-Key', modalKey)
                  if (modalSecret) proxyReq.setHeader('Modal-Secret', modalSecret)
                })
              },
            },
          }
        : {},
    },
  }
})
