import { isObject } from '@cc-heart/utils'
import { output } from './output'
import { getTypeStruct } from './typeStruct'
import { isArrayObject } from './utils'
import { TypeGroup } from './helper'
import type { ITypeStruct, JsonToTSOptions } from './helper'
export default function generateTypeDeclaration(target: unknown, options: JsonToTSOptions = {}) {
  const defaultOptions = {
    rootName: 'IRootName',
  }

  if (!isObject(target) && !isArrayObject(target)) {
    throw new Error('target must be object or objectArray')
  }

  const newOption = { ...defaultOptions, ...options }
  const typeStructList: ITypeStruct[] = []
  getTypeStruct(target, typeStructList, newOption.rootName, TypeGroup.Object, true)
  return output(typeStructList, newOption.rootName, Array.isArray(target))
}
