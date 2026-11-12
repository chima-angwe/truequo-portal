import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

function githubPagesSpaFallback() {
  return {
    name: 'github-pages-spa-fallback',
    apply: 'build',
    writeBundle() {
      const outputDir = resolve(process.cwd(), 'dist');
      copyFileSync(resolve(outputDir, 'index.html'), resolve(outputDir, '404.html'));
    },
  };
}

export default defineConfig({
  plugins: [react(), githubPagesSpaFallback()],
  base: '/truequo-portal/',
  server: {
    port: 5173,
  },
});
