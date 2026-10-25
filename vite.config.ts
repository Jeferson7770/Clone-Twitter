import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      '/api-ibge': {
        target: 'https://servicodados.ibge.gov.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-ibge/, ''),
      },
    },
  },
});
