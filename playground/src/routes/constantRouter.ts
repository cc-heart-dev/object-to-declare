import { RouteRecordRaw } from 'vue-router'
export default [
  {
    path: '/',
    component: () => import('@/components/playground/playground'),
  },
] as RouteRecordRaw[]
