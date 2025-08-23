import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/pg': {
        target: 'https://sandbox.cashfree.com',
        changeOrigin: true,
        secure: true,
      },
      '/api/create-payment': {
        target: 'https://sandbox.cashfree.com',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/pg/orders',
      },
    },
  },
})
