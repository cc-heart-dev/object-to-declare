<template>
  <div class="code-mirror">
    <div ref="codeRef"></div>
    <button class="copy-btn" :class="[isCopyCodeState ? 'copy-btn-copied' : '']" @click="copyCode">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256">
        <path
          fill="currentColor"
          d="M216 34H88a6 6 0 0 0-6 6v42H40a6 6 0 0 0-6 6v128a6 6 0 0 0 6 6h128a6 6 0 0 0 6-6v-42h42a6 6 0 0 0 6-6V40a6 6 0 0 0-6-6Zm-54 176H46V94h116Zm48-48h-36V88a6 6 0 0 0-6-6H94V46h116Z"
        />
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
        <path fill="currentColor" d="M18.9 8.1L9 18l-4.95-4.95l.71-.71L9 16.59l9.19-9.2l.71.71Z" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { isDark } from '@/configs/index'
import { usePrefixCls } from '@/hooks'
import { copy } from '@cc-heart/utils-client'
import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView, basicSetup } from 'codemirror'
import { onMounted, reactive, ref, watch } from 'vue'
import { IProps } from './helper'

const props = withDefaults(defineProps<IProps>(), {
  isReadonly: false,
  lang: 'javascript',
})
const val = ref('')

const state = reactive({
  length: 0,
})

const codeRef = ref(null)

const isCopyCodeState = ref(false)

const copyCode = () => {
  const value = getValue()
  isCopyCodeState.value = true
  value && copy(value)
  setTimeout(() => {
    isCopyCodeState.value = false
  }, 1000)
}
interface viewInstance {
  viewState: {
    state: {
      doc: {
        text: string[]
      }
    }
  }
}
let view: EditorView
let lang = () =>
  javascript({
    typescript: true,
    jsx: true,
  })

const emits = defineEmits<{
  (event: 'change', value: string): void
}>()
switch (props.lang) {
  case 'css':
    lang = () => css()
    break
  case 'html':
    lang = () => html()
    break
  case 'json':
    lang = () => json()
}

const cls = usePrefixCls('code')

watch(isDark, () => {
  updateTheme()
})
function updateTheme() {
  if (view) view && view.destroy()
  if (isDark.value) {
    view = new EditorView({
      extensions: [basicSetup, lang(), EditorView.editable.of(!props.isReadonly), oneDark, EditorView.editorAttributes.of({ class: cls })],
      parent: codeRef.value!,
      doc: props.value || val.value,
      dispatch(tr) {
        view.update([tr])
        state.length = tr.state.doc.length
        val.value = view.state.doc.toString()
      },
    })
  } else {
    view = new EditorView({
      extensions: [basicSetup, lang(), EditorView.editable.of(!props.isReadonly), EditorView.editorAttributes.of({ class: cls })],
      parent: codeRef.value!,
      doc: props.value || val.value,
      dispatch(tr) {
        view.update([tr])
        state.length = tr.state.doc.length
        val.value = view.state.doc.toString()
      },
    })
  }
}
onMounted(() => {
  updateTheme()
})

watch(
  () => val.value,
  (data) => {
    if (val.value !== props.value) {
      if (props.onChange instanceof Function) {
        props.onChange(data)
      } else {
        emits('change', data)
      }
    }
  },
)

watch(
  () => props.value,
  (data) => {
    if (data) {
      if (data !== val.value) {
        setValue(data)
        val.value = data
      }
    }
  },
)

function clear() {
  // console.log(state.length, 'state.length');
  view.dispatch({ changes: [{ from: 0, to: state.length }] })
}

function getValue() {
  return (view as EditorView & viewInstance).viewState.state.doc.text.join('\n')
}
function setValue(value: string) {
  view.dispatch({ changes: [{ from: 0, insert: value }] })
}
defineExpose({
  clear,
  getValue,
  setValue,
})
</script>

<style lang="scss">
@use '@/assets/scss/var/variable.scss' as var;

.code-mirror {
  --btn-background-color: rgb(246, 248, 250);
  --btn-color: rgb(17, 24, 39);
  --btn-color-hover: rgb(17, 24, 30);
  --border-color: rgba(31, 35, 40, 0.15);
  --border-color-hover: rgba(31, 35, 40, 0.3);

  &:hover {
    .copy-btn {
      opacity: 1;
      pointer-events: all;
    }
  }

  flex: 1;
  overflow: hidden;
  position: relative;

  & > div {
    width: 100%;
    height: 100%;
  }
}

.cm-editor {
  height: 100% !important;
  width: 100% !important;
  font-family: inherit;
}

.cm-content {
  cursor: text !important;
}

.cm-gutters,
.cm-gutterElement,
.cm-activeLineGutter {
  background-color: transparent !important;
}

.cm-gutters {
  border-right: 1px solid var(--box-color-1) !important;
}

.cm-activeLineGutter {
  color: var(--color-text-1);
}

.dark .code-mirror {
  --btn-background-color: rgb(33, 38, 45);
  --btn-color: rgba(201, 209, 217, 0.8);
  --btn-color-hover: rgb(241, 245, 249);
  --border-color: rgba(240, 246, 252, 0.1);
  --border-color-hover: rgb(139, 148, 158);
}

.copy-btn {
  position: absolute;
  right: 1rem;
  top: 0.5rem;
  opacity: 0;
  outline-offset: 2px;
  outline: 2px solid transparent;
  cursor: pointer;
  pointer-events: none;
  z-index: 2;
  color: var(--btn-color);
  background-color: var(--btn-background-color);
  border-radius: 0.375rem;
  border: 1px solid var(--border-color);
  transition: all 0.28s;

  &:hover {
    border-color: var(--border-color-hover);
    color: var(--btn-color-hover);
  }

  svg {
    padding: 0.375rem;
    vertical-align: middle;

    &:nth-child(1) {
      opacity: 1;
    }

    &:nth-child(2) {
      position: absolute;
      left: 0;
      opacity: 0;
    }
  }

  &.copy-btn-copied {
    svg {
      &:nth-child(1) {
        opacity: 0;
      }

      &:nth-child(2) {
        opacity: 1;
      }
    }
  }
}
</style>
