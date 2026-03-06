/* eslint-disable no-undef */
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
        exposes: {
          './AuthCore': './src/auth/auth-core-proxy.js',
        },
        shared: {
          react: { singleton: true, requiredVersion: '^18.0.0' },
          'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
          '@devpulse/auth-core': { singleton: true, requiredVersion: '1.0.0' },
        },
      }),
    ],
    resolve: {
      alias: {
        '@devpulse/auth-core': new URL('./src/auth/auth-core-proxy.js', import.meta.url).pathname,
      },
    },
    build: { target: 'esnext', minify: false, cssCodeSplit: false },
    server: { port: 3000, cors: true },
    preview: { port: 3000, cors: true },
  };
});