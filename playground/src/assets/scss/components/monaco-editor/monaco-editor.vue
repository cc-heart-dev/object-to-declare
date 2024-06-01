<template>
  <div ref="monacoRef"></div>
</template>
<script lang="ts" setup>
import { ref, onMounted, watchEffect } from 'vue'
import { MonacoEditorProps } from './helper'
import { editor } from 'monaco-editor'

const props = defineProps(MonacoEditorProps)

const monacoRef = ref()
let monacoEditorInstance: editor.IStandaloneCodeEditor | null = null

const updateMonacoValue = (value: string) => {
  monacoEditorInstance?.setValue(value)
}
watchEffect(() => {
  updateMonacoValue(props.modelValue)
})

const getValue = () => {
  return monacoEditorInstance?.getValue()
}

onMounted(() => {
  monacoEditorInstance = editor.create(monacoRef.value, {
    language: 'javascript',
    value: '',
    folding: true,
    theme: props.theme,
    scrollbar: {
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8
    },
    minimap: {
      enabled: props.minimapEnabled
    },
    renderValidationDecorations: 'on'
  })
})

defineExpose({
  updateMonacoValue,
  getValue
})
</script>
