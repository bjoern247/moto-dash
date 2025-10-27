import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './tailwind.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.error('ServiceWorker registration failed:', err))
  })
}

app.mount('#app')
