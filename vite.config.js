import { defineConfig } from 'vite';
import { registerMultiplayerRoutes } from './src/server/multiplayerMiddleware.js';

function lanMultiplayerPlugin() {
  return {
    name: 'lan-multiplayer-plugin',
    configureServer(server) {
      registerMultiplayerRoutes(server.middlewares);
    },
    configurePreviewServer(server) {
      registerMultiplayerRoutes(server.middlewares);
    }
  };
}

export default defineConfig({
  plugins: [
    lanMultiplayerPlugin()
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true
  },
  build: {
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const path = id.replace(/\\/g, '/');
          if (path.includes('/node_modules/phaser/')) return 'vendor-phaser';
          if (path.includes('/node_modules/@supabase/')) return 'vendor-supabase';
          if (path.includes('/src/scenes/')) return 'game-scenes';
          if (path.includes('/src/minigames/')) return 'mini-games';
          if (path.includes('/src/questions/')) return 'curriculum';
          if (path.includes('/src/data/') || path.includes('/src/locales/')) return 'game-content';
          if (path.includes('/src/managers/')) return 'game-managers';
          return undefined;
        }
      }
    }
  }
});
