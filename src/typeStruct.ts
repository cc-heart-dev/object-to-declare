import { isBool, isNumber, isObject, isStr, isUndef } from '@cc-heart/utils'
import { TypeGroup, type ITypeStruct } from './helper'

export function getTypeGroup(target: unknown) {
  if (isStr(target)) return TypeGroup.String
  if (isUndef(target)) return TypeGroup.Undefined
  if (isNumber(target)) return TypeGroup.Number
  if (isBool(target)) return TypeGroup.Boolean
  if (Array.isArray(target)) return TypeGroup.Array
  if (isObject(target)) return TypeGroup.Object
  return TypeGroup.Null
}

const noFieldName = '__$$NO_FIELD_NAME$$__'

export function getTypeStruct(target: unknown, field: string | symbol) {
  const typeStruct: ITypeStruct = {
    field,
    type: TypeGroup.Null,
    declares: 'type',
  }
  switch (getTypeGroup(target)) {
    case TypeGroup.String:
      typeStruct.type = TypeGroup.String
      break
    case TypeGroup.Number:
      typeStruct.type = TypeGroup.Number
      break
    case TypeGroup.Boolean:
      typeStruct.type = TypeGroup.Boolean
      break
    case TypeGroup.Undefined:
      typeStruct.type = TypeGroup.Undefined
      break
    case TypeGroup.Array:
      typeStruct.type = TypeGroup.Array;
      typeStruct.target = [];
      (target as Array<unknown>).forEach(item => {
        const children = getTypeStruct(item, noFieldName)
        typeStruct.target.push(children)
      })
      break
    case TypeGroup.Object:
      typeStruct.declares = 'interface';
      typeStruct.type = TypeGroup.Object;
      typeStruct.target = [];
      Object.keys(target as Record<string, unknown>).forEach(key => {
        const children = getTypeStruct(target[key], key)
        typeStruct.target.push(children)
      })
      break
  }
  return typeStruct
}


export const parseTypeMapTsType = (typeStruct: ITypeStruct) => {
  switch (typeStruct.type) {
    case TypeGroup.String:
      return 'string'
    case TypeGroup.Number:
      return 'number'

    case TypeGroup.Boolean:
      return 'boolean'

    case TypeGroup.Undefined:
      return 'undefined'

    case TypeGroup.Array:
      const arrayTypeStruct = [...new Set(typeStruct.target.map(target => {
        return parseTypeMapTsType(target)
      }))].join(' | ')

      return `Array<${arrayTypeStruct}>`

    case TypeGroup.Object:
      const objectTypeStruct = typeStruct.target.map(target => {
        return `\t${String(target.field)}: ${parseTypeMapTsType(target)}\n`
      }).join('')
      return `{\n${objectTypeStruct}}`
  }
  return 'null'

}
export const parseTypeStruct = (typeStruct: ITypeStruct, isRoot = false) => {
  let value = parseTypeMapTsType(typeStruct)
  return `${isRoot ? typeStruct.declares : ''} ${String(typeStruct.field)} = ${value}`
}