import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    target: mode === 'mobile' ? 'es2015' : 'es2020',
    minify: mode === 'mobile' ? 'terser' : 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          game: ['./src/game/GameEngine.ts'],
        },
      },
    },
  },
  define: {
    __MOBILE_BUILD__: mode === 'mobile',
    __DESKTOP_BUILD__: mode === 'desktop',
  },
  server: {
    host: true,
    port: 5173,
  },
}));