import { isObject } from '@cc-heart/utils'

export function isArrayObject(target: unknown) {
  return Array.isArray(target) && target.reduce<boolean>((acc, cur) => acc && isObject(cur), true)
}

export function getHashByObject(obj: unknown) {
  const hash = JSON.stringify(obj)
  return hash
}

export function isHash(target: string) {
  try {
    JSON.parse(target)
    return true
  } catch {
    return false
  }
}
