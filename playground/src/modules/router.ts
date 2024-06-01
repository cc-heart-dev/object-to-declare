import { App } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import routes from '~pages'
import LocalRouters from '@/routes/index'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [...LocalRouters, ...routes]
})

export const setup = ({ app }: { app: App }) => {
  app.use(router)
}
