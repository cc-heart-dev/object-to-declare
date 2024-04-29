import { isObject } from '@cc-heart/utils'

export function isArrayObject(target: unknown) {
  return Array.isArray(target) && target.reduce<boolean>((acc, cur) => acc && isObject(cur), true)
}