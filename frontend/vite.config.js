import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:8000',
      '/pdfs': 'http://localhost:8000',
      '/quiz': 'http://localhost:8000',
      '/stats': 'http://localhost:8000',
    },
  },
});
