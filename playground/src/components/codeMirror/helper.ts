import { type fn } from '@cc-heart/utils/helper'

export interface CodeMirrorExpose {
  clear: fn
  getValue: fn
  setValue: fn
}

export interface IProps {
  isReadonly?: boolean
  lang?: 'javascript' | 'css' | 'html' | 'json'
  value?: string
  onChange?: fn
}