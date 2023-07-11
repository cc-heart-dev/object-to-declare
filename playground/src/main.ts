import { createApp } from 'vue'
import App from './App.vue'
import 'uno.css'
import '@/assets/scss/theme.scss'
import './main.css'
import './modules/i18n'
// 标题
import 'splitpanes/dist/splitpanes.css'

const app = createApp(App)

Object.entries(import.meta.glob('./modules/*.ts', { eager: true })).forEach(([, Module]) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Module.setup?.({ app })
})

app.mount('#app')
