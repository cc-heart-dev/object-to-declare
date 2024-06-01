export const MonacoEditorProps = {
  theme: {
    type: String,
    default: 'vs-dark',
    validator: (value: string) => ['vs', 'vs-dark', 'hc-black'].includes(value)
  },
  minimapEnabled: {
    type: Boolean,
    default: true
  },
  modelValue: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'javascript'
  }
}
