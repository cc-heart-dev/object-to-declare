import { prefixCls } from '@/configs'

export function usePrefixCls(cls: string) {
  if (cls === undefined) return prefixCls
  return `${prefixCls}-${cls}`
}
