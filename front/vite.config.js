
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: process.env.FRONT_PORT || 3001,
    proxy: {
      '/api': {
        target: process.env.API_URL || 'http://localhost:5001',
        changeOrigin: true,
      },
    },
    allowedHosts: ['.aict.pro'],
  },
  optimizeDeps: {
      force: true  // Force re-optimization on every start
    }
});