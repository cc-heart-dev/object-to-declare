/// <reference types="vite/client" />
/// <reference types="vite-plugin-pages/client" />
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, any>
  export default component
}

declare module 'vue-i18n' {
  export * from 'node_modules/vue-i18n/dist/vue-i18n'
}

