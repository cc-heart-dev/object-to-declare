import { Splitpanes, Pane } from 'splitpanes'
import { Ref, watch, defineComponent, ref } from 'vue'
import '@/assets/scss/components/playground/playground.scss'
import CodeMirror from '@/components/codeMirror/index.vue'
import Card from '@/components/Card/Container'
import { useDebounce } from '@/hooks/useDebounce'
import generateTypeDeclaration from '@cc-heart/object-to-declare'
import { copy } from '@cc-heart/utils-client'

type fn = (...args: any) => any
export default defineComponent({
  name: 'Playground',
  setup() {
    const script = ref('')
    const typeInstanceRef = ref<{ clear: fn; setValue: fn } | null>(null)
    const typeDeclaration = ref<string | null>(null)
    const handleChange = (event: string, refs: Ref<string>) => {
      refs.value = event
    }

    const func = useDebounce((data) => {
      try {
        const target = new Function(`return ${data.trim()}`)()
        typeDeclaration.value = generateTypeDeclaration(target)
        typeInstanceRef.value?.clear()
        typeInstanceRef.value?.setValue(typeDeclaration.value)
      } catch (e) {
        console.log(e)
        typeInstanceRef.value?.clear()
        typeInstanceRef.value?.setValue((e as Error).toString())
      }
    }, 500)


    watch(
      () => script.value,
      (data) => {
        func(data)
      },
    )
    return () => (
      <div class="p-3 flex-1 overflow-auto">
        <Splitpanes class="default-theme">
          <Pane>
            <Splitpanes class="default-theme" horizontal>
              <Pane>
                <Card v-slots={{ title: () => 'input object or array object' }}>
                  <CodeMirror value={script.value} lang="json" onChange={(e) => handleChange(e, script)} />
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
              <CodeMirror
                ref={typeInstanceRef}
                // value={typeDeclaration.value}
              />
            </Card>
          </Pane>
        </Splitpanes>
      </div>
    )
  },
})
