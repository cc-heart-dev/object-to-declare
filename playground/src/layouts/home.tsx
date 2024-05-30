import { defineComponent } from 'vue'
import Headers from '@/components/header/headers.vue'

export default defineComponent({
  setup() {
    return () => (
      <main class="flex flex-col h-full w-full text-gray-700 dark:text-gray-200">
        <Headers>{{ left: () => <h2>Json To DTS Playground</h2> }}</Headers>
        <router-view />
      </main>
    )
  },
})
