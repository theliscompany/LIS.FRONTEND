import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // structure principale
      '@components': path.resolve(__dirname, 'src/components'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@api': path.resolve(__dirname, 'src/api'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),

      // alias de compatibilité (ancienne structure)
      '@old-pages/pricing': path.resolve(__dirname, 'src/features/pricing/pages'),
      '@old-pages/offer': path.resolve(__dirname, 'src/features/offer/pages'),
      '@old-pages/quote': path.resolve(__dirname, 'src/features/quote/pages'),
      '@old-pages/shipment': path.resolve(__dirname, 'src/features/shipment/pages'),
      '@old-pages/masterdata': path.resolve(__dirname, 'src/features/masterdata/pages'),

      '@old-components/pricing': path.resolve(__dirname, 'src/features/pricing/components'),
      '@old-components/offer': path.resolve(__dirname, 'src/features/offer/components'),
      '@old-components/quote': path.resolve(__dirname, 'src/features/quote/components'),
      '@old-components/shipment': path.resolve(__dirname, 'src/features/shipment/components'),
      '@old-components/masterdata': path.resolve(__dirname, 'src/features/masterdata/components'),
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5025',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    },
    // Serve types.gen.ts files
    fs: {
      allow: ['..']
    }
  }
})
