import { defineConfig, loadEnv } from 'vite'
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
          remote_vue: `${env.VITE_VUE_FEED_URL}/assets/remoteEntry.js`,
          remote_angular: `${env.VITE_ANGULAR_BOARD_URL}/remoteEntry.js`,
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
