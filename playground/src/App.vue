<template>
  <main class="flex flex-col h-full w-full">
    <Headers>
      <template #left>
        <h2>{{ title }}</h2>
      </template>
    </Headers>
    <div class="p-3 flex-1 flex overflow-auto">
      <div class="w-62.5 box-border p-2 p-t-0 text-3.5 shrink-0">
        <div class="flex justify-between items-center m-b-2">
          <div>Object To DTS Version</div>
          <div>{{ version }}</div>
        </div>
        <div class="flex justify-between items-center">
          <div>Root Name</div>
          <input v-model="compileValue.rootName" :placeholder="defaultRootName"
            class="bg-transparent outline-none border-1px border-solid border-color-#353841 rounded-1 p-y-0.5 p-x-1 color-inherit hover:border-color-#ddd focus:border-color-#ddd transition" />
        </div>
      </div>
      <div class="flex-1 overflow-auto">
        <Splitpanes class="default-theme" :horizontal="isMobileRef">
          <Pane>
            <MonacoEditor language="json" title="Json" @update:model-value="handleChangeJsonValue" />
          </Pane>
          <Pane>
            <MonacoEditor language="typescript" title="DTS" v-model="compileValue.dtsValue" />
          </Pane>
        </Splitpanes>
      </div>

    </div>
  </main>
</template>

<script setup lang="ts">
import Headers from '@/components/header/headers.vue'
import { title } from './configs';
import { computed, reactive, watchEffect } from 'vue';
import { Pane, Splitpanes } from 'splitpanes'
import { MonacoEditor } from '@/components/monaco-editor/index'
import generateTypeDeclaration, { version } from '@cc-heart/object-to-declare';

const defaultRootName = 'RootName'
const compileValue = reactive({
  rootName: defaultRootName,
  jsonValue: '',
  dtsValue: ''
})
const isMobileRef = computed(() => {
  return window.innerWidth <= 768
})

const handleChangeJsonValue = (val: string) => {
  compileValue.jsonValue = val
}
watchEffect(() => {
  if (compileValue.jsonValue === '') {
    compileValue.dtsValue = ''
    return
  }
  const target = new Function(`return ${compileValue.jsonValue.trim()}`)()
  compileValue.dtsValue = generateTypeDeclaration(target, {
    rootName: compileValue.rootName || defaultRootName
  })
})
</script>

<style lang="scss">
.splitpanes__splitter,
.splitpanes__pane {
  background-color: transparent !important;
}

.splitpanes__splitter {
  border: none !important;
}
</style>