import '@/assets/scss/components/playground/playground.scss'
import Card from '@/components/Card/Container'
import CodeMirror from '@/components/codeMirror/index.vue'
import { useDebounce } from '@/hooks/useDebounce'
import generateTypeDeclaration from '@cc-heart/object-to-declare'
import { Pane, Splitpanes } from 'splitpanes'
import { Ref, defineComponent, onMounted, onUnmounted, ref, unref, watch } from 'vue'
import { CodeMirrorExpose } from '../codeMirror/helper'

export default defineComponent({
  name: 'Playground',
  setup() {
    const script = ref('')
    const isMobileRef = ref(isMobileWidth())
    const typeInstanceRef = ref<CodeMirrorExpose>()
    const rootName = ref('RootName')
    const typeDeclaration = ref<string | null>(null)
    const handleChange = (event: string, refs: Ref<string>) => {
      refs.value = event
    }

    const func = useDebounce((data) => {
      try {
        const target = new Function(`return ${data.trim()}`)()
        typeDeclaration.value = generateTypeDeclaration(target, {
          rootName: unref(rootName),
        })
        typeInstanceRef.value?.clear()
        typeInstanceRef.value?.setValue(typeDeclaration.value)
      } catch (e) {
        console.log(e)
        typeInstanceRef.value?.clear()
        typeInstanceRef.value?.setValue((e as Error).toString())
      }
    }, 500)

    watch(
      () => [script.value, rootName.value],
      ([data]) => {
        func(data)
      },
    )
    function isMobileWidth() {
      return window.innerWidth <= 768
    }

    const listenerViewPortWidthChange = useDebounce(() => {
      isMobileRef.value = isMobileWidth()
    }, 300)

    const handleChangeRootName = (e: Event) => {
      rootName.value = (e.target as HTMLInputElement).value
    }

    onMounted(() => {
      window.addEventListener('resize', listenerViewPortWidthChange)
    })
    onUnmounted(() => {
      window.removeEventListener('resize', listenerViewPortWidthChange)
    })

    return () => (
      <div class="p-3 flex-1 overflow-auto">
        <Splitpanes class="default-theme" horizontal={isMobileRef.value}>
          <Pane>
            <Splitpanes class="default-theme" horizontal>
              <Pane>
                <Card
                  v-slots={{
                    title: () => (
                      <div class="flex justify-between">
                        <div>input object or array object</div>
                        <div>
                          <input value={rootName.value} onChange={(e: Event) => handleChangeRootName(e)} />
                        </div>
                      </div>
                    ),
                  }}
                >
                  <CodeMirror value={script.value} lang="javascript" onChange={(e: string) => handleChange(e, script)} />
                </Card>
              </Pane>
            </Splitpanes>
          </Pane>
          <Pane>
            <Card
              v-slots={{
                title: () => (
                  <div class="flex w-full items-center justify-between">
                    <span>output types</span>
                  </div>
                ),
              }}
            >
              <CodeMirror ref={(e: unknown) => (typeInstanceRef.value = e as CodeMirrorExpose)} />
            </Card>
          </Pane>
        </Splitpanes>
      </div>
    )
  },
})
