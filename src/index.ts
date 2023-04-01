import { isObject } from '@cc-heart/utils'
import { covertToInterface } from './convertToInterface'
import { output } from './output'
import { getTypeStruct } from './typeStruct'
import { isArrayObject } from './utils'
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
  getTypeStruct(target, typeStructList, newOption.rootName)

  return covertToInterface(output(typeStructList, newOption.rootName, Array.isArray(target)))
}
