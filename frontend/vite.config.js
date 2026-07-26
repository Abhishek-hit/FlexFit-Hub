import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // sockjs-client (used for the WebSocket/STOMP live feed) expects Node's
  // `global` object, which doesn't exist in the browser — alias it to
  // `globalThis` so Vite's dev server and production build both work.
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5173,
  },
});
