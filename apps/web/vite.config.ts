import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
/// <reference types="vitest" />

const localApiTarget = 'http://127.0.0.1:4000';

export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
    exclude: ['dist/**', 'node_modules/**'],
  },
  resolve: {
    alias: {
      '@game/shared': resolve(__dirname, '../../packages/shared/src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/auth': localApiTarget,
      '/api': localApiTarget,
      '/admin': localApiTarget,
      '/webhooks': localApiTarget,
      '/profile': localApiTarget,
      '/boosts': localApiTarget,
      '/game': localApiTarget,
      '/leaderboard': localApiTarget,
      '/payments': localApiTarget,
      '/links': localApiTarget,
      '/referral': localApiTarget,
      '/withdrawals': localApiTarget,
      '/income': localApiTarget,
      '/shop': localApiTarget,
      '/levels': localApiTarget,
      '/missions': localApiTarget,
      '/daily': localApiTarget,
      '/onboarding': localApiTarget,
      '/clans': localApiTarget,
      '/chests': localApiTarget,
      '/prestige': localApiTarget,
      '/health': localApiTarget
    }
  }
});
