import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Allow external connections
    proxy: {
      // Proxy API calls to Vercel dev server (localhost:3000)
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('Proxy error:', err);
            }
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('Proxying:', req.method, req.url, '→', options.target);
            }
          });
        },
      },
      // Proxy Cashfree API calls (if needed for direct frontend calls)
      '/pg': {
        target: 'https://sandbox.cashfree.com',
        changeOrigin: true,
        secure: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('Proxying Cashfree:', req.method, req.url, '→', options.target);
            }
          });
        },
      },
    },
  },
  // Development-specific settings
  define: {
    __DEV__: process.env.NODE_ENV === 'development',
  },
  // Optimize for production
  build: {
    sourcemap: false, // Disable sourcemaps in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
  },
})


