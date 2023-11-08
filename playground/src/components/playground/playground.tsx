import { Splitpanes, Pane } from 'splitpanes'
import { Ref, watch, defineComponent, ref, onMounted, onUnmounted } from 'vue'
import '@/assets/scss/components/playground/playground.scss'
import CodeMirror from '@/components/codeMirror/index.vue'
import Card from '@/components/Card/Container'
import { useDebounce } from '@/hooks/useDebounce'
import generateTypeDeclaration from '@cc-heart/object-to-declare'

type fn = (...args: any) => any
export default defineComponent({
  name: 'Playground',
  setup() {
    const script = ref('')
    const isMobileRef = ref(isMobileWidth())
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
    function isMobileWidth() {
      return window.innerWidth <= 768
    }

    const listenerViewPortWidthChange = useDebounce(() => {
      isMobileRef.value = isMobileWidth()
    }, 300)

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
                <Card v-slots={{ title: () => 'input object or array object' }}>
                  {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                  {/* @ts-ignore */}
                  <CodeMirror value={script.value} lang="javascript" onChange={(e:string) => handleChange(e, script)} />
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
