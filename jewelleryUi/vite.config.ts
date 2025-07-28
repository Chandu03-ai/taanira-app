import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

console.log("VITE_API_BASE_URL:", process.env.VITE_API_BASE_URL)
export default defineConfig({
  
  plugins: [react()],
  define: {
    'process.env': {}
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://192.168.0.107:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});