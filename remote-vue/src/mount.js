import { createApp } from 'vue'
import App from './App.vue'

export const mountVue = (el) => {
  const app = createApp(App)
  app.mount(el)
  return app 
}