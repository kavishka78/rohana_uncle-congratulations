import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync } from 'node:fs';
export default defineConfig({ base: './', plugins: [react()], define: {
  __PHOTO_URL__: JSON.stringify(['jpeg', 'jpg'].map(ext => `/images/uncle-rohana.${ext}`).find(path => existsSync(`public${path}`)) ?? null),
  __MODEL_URL__: JSON.stringify(existsSync('public/models/vezel.glb') ? '/models/vezel.glb' : null),
} });
