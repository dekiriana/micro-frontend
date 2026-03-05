import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'remote_vue',
      filename: 'remoteEntry.js',
      exposes: {
        './VueRoot': './src/mount.js',
      },
      shared:['vue']
    }),
  ],
  build: {target:'esnext', minify:false,cssCodeSplit:false},
  server: {port:4202, cors:true},
  preview: {port:4202, cors:true}
})
