import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relatieve paden, zodat de site ook in een submap werkt (GitHub Pages).
  base: './',
  plugins: [react()],
});
