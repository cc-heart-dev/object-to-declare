import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import Pages from 'vite-plugin-pages'

export default defineConfig({
  plugins: [vue(), vueJsx(), UnoCSS(), Pages({ dirs: 'src/pages' })],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
