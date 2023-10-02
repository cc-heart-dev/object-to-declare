import { capitalize, isObject } from '@cc-heart/utils'

export function isArrayObject(target: unknown) {
  return Array.isArray(target) && target.reduce<boolean>((acc, cur) => acc && isObject(cur), true)
}

export function getHashByObject(obj: unknown) {
  const hash = JSON.stringify(obj)
  return hash
}

export function isJSON(target: string) {
  try {
    const hash = JSON.parse(target)
    return hash !== null && !Array.isArray(hash)
  } catch {
    return false
  }
}

export function isValidPropertyName(name: string) {
  // 是否是合法的属性名字
  return /^[a-zA-Z0-9]*$/.test(name)
}

function isValidInterfaceName(name: string) {
  return /^[a-zA-z0-9_]*$/.test(name)
}

export function parseInterface(name: string) {
  return name
    .split('_')
    .map((_) => capitalize(_))
    .map((_) => (!isValidInterfaceName(_) ? '__Valid' : _))
    .join('_')
}
