<template>
  <div class="box-border bg-#25272e p-y-2 p-x-4">{{ title }}</div>
  <div ref="monacoRef" class="w-full h-full"></div>
</template>
<script lang="ts" setup>
import { ref, onMounted, watchEffect } from 'vue'
import { MonacoEditorProps } from './helper'
import { editor } from 'monaco-editor'
import { defineDebounceFn } from '@cc-heart/utils'

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

const emits = defineEmits(['update:modelValue'])
const debounceUpdateModelValue = defineDebounceFn(() => {
  emits('update:modelValue', getValue())
})

onMounted(() => {
  monacoEditorInstance = editor.create(monacoRef.value, {
    language: props.language,
    value: props.modelValue,
    folding: true,
    theme: props.theme,
    readOnly: props.readonly,
    scrollbar: {
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8
    },
    minimap: {
      enabled: props.minimapEnabled
    },
    automaticLayout: true,
    renderValidationDecorations: 'on'
  })
  monacoEditorInstance.onDidChangeModelContent(debounceUpdateModelValue)
})

defineExpose({
  updateMonacoValue,
  getValue
})
</script>
