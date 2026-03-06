// host-react/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      federation({
        name: 'host_devpulse',
        remotes: {
          // Sekarang URL-nya dinamis mengikuti isi file .env!
          remote_feed: `${env.VITE_VUE_FEED_URL}/assets/remoteEntry.js`,
          remote_board: `${env.VITE_ANGULAR_BOARD_URL}/remoteEntry.js`,
        },
        shared: ['react', 'react-dom'],
      }),
    ],
    build: {
      target: 'esnext',
      minify: false,
      cssCodeSplit: false,
    },
    server: {
      port: 3000,
      cors: true,
    },
    preview: {
      port: 3000,
      cors: true,
    },
  };
});
