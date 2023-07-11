import { isNull, isObject } from '@cc-heart/utils'
import { getHashByObject } from './utils'
import { type ITypeStruct, TypeGroup } from './helper'

export function getTypeGroup(target: unknown) {
  if (Array.isArray(target)) return TypeGroup.Array
  if (isObject(target)) return TypeGroup.Object
  return TypeGroup.Primitive
}

export function getTypeStruct(targetObj: unknown, typeStructList: ITypeStruct[] = [], name = '', type = TypeGroup.Object) {
  switch (getTypeGroup(targetObj)) {
    case TypeGroup.Array:
      const typeArrayStructList = (targetObj as Array<unknown>)
        .map((val) => {
          return getTypeStruct(val, typeStructList, name, TypeGroup.Array)
        })
        .filter((val, index, self) => self.indexOf(val) === index)
      switch (typeArrayStructList.length) {
        case 0:
          return []
        case 1:
          return typeArrayStructList.join(' | ')
        default:
          return `(${typeArrayStructList.join(' | ')})[]`
      }
    case TypeGroup.Object:
      const target = getTypeOfObject(targetObj as object, typeStructList)
      const hash = getHashByObject(target)
      typeStructList.push({
        hash,
        name,
        target,
        type,
      })
      return hash
    case TypeGroup.Primitive:
      return getTypeOfPrimitive(targetObj)
  }
}

function getTypeOfObject<T extends object>(targetObj: T, typeStructList: ITypeStruct[]) {
  return Object.entries(targetObj).reduce((acc, [key, value]) => {
    // object array primitive
    acc[key] = getTypeStruct(value, typeStructList, key, TypeGroup.Object)
    return acc
  }, {} as Record<keyof T, string>)
}

function getTypeOfPrimitive(target: unknown) {
  if (isNull(target)) return null
  return typeof target
}
