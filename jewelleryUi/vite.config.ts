import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  console.log('VITE_API_BASE_URL:', env.VITE_API_BASE_URL);

  return {
    plugins: [react()],
    
    optimizeDeps: {
      exclude: ['lucide-react'],
    },

    // Required only if you use `vite preview` in Docker or via hostname
    preview: {
      host: true,
      port: 4173,
      allowedHosts: ['taanira_ui'], // 👈 safer than 'all' in production
    },

    server: {
      host: true, // 👈 allows access via Docker hostname or LAN
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8000',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});
