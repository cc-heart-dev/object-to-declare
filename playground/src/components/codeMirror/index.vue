<template>
  <div class="code-mirror" ref="codeRef"></div>
</template>

<script setup lang="ts">
import { EditorView, basicSetup } from 'codemirror'
import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { isDark } from '@/configs/index'
import { onMounted, reactive, ref, watch } from 'vue'
import { usePrefixCls } from '@/hooks'
interface IProps {
  isReadonly?: boolean
  lang?: 'javascript' | 'css' | 'html' | 'json'
  value?: string
}
const props = withDefaults(defineProps<IProps>(), {
  isReadonly: false,
  lang: 'javascript',
})
const val = ref('')

const state = reactive({
  length: 0,
})

watch(isDark, (bool) => {
  if (bool) {
  }
})
const codeRef = ref(null)
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
    // @ts-ignore
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
    if (val.value !== props.value) emits('change', data)
  }
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
  }
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
  flex: 1;
  overflow: hidden;
  // flex-grow: 0;
  // overflow: auto;
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

// .#{var.$prefixCls}-code {
//   &.ͼo {
//     background-color: transparent;
//   }
// }
</style>
