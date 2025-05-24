import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': process.env.VITE_BACKEND_URL || 'https://doctor-backend-ylju.onrender.com', // Using environment variable with fallback
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: [ '@emotion/react', '@emotion/styled', 'framer-motion'],
  },
  
});
