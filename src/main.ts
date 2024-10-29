import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import messages from './i18n'
import './style.css'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  messages
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)
app