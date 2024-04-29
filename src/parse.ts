import { isBool, isNumber, isObject, isStr, isUndef } from '@cc-heart/utils'
import { TypeGroup, TypeStructTree } from "./helper"

function parseValueMapTypeGroup(target: unknown) {
  if (isStr(target)) return TypeGroup.String
  if (isUndef(target)) return TypeGroup.Undefined
  if (isNumber(target)) return TypeGroup.Number
  if (isBool(target)) return TypeGroup.Boolean
  if (Array.isArray(target)) return TypeGroup.Array
  if (isObject(target)) return TypeGroup.Object
  return TypeGroup.Null
}


export function generatorTypeStructTree(target: unknown, field: string, parentTreeMap?: Map<string, TypeStructTree>) {
  let typeStructTree: TypeStructTree = parentTreeMap?.get(field) ?? {
    type: [],
  }

  switch (parseValueMapTypeGroup(target)) {
    case TypeGroup.String:
      typeStructTree.type = [...(typeStructTree.type ?? []), TypeGroup.String]
      break
    case TypeGroup.Number:
      typeStructTree.type = [...(typeStructTree.type ?? []), TypeGroup.Number]
      break
    case TypeGroup.Boolean:
      typeStructTree.type = [...(typeStructTree.type ?? []), TypeGroup.Boolean]
      break
    case TypeGroup.Null:
      typeStructTree.type = [...(typeStructTree.type ?? []), TypeGroup.Null]
      break
    case TypeGroup.Undefined:
      typeStructTree.type = [...(typeStructTree.type ?? []), TypeGroup.Undefined]
      break
    case TypeGroup.Array:
      if (!typeStructTree.children) {
        typeStructTree.children = new Map()
      }
      typeStructTree.type = [...(typeStructTree.type ?? []), TypeGroup.Array]

      const arrayField = `${field}_$$children`;

      (target as Array<unknown>).forEach(item => {
        const children = generatorTypeStructTree(item, arrayField, typeStructTree.children)
        const prevValue = typeStructTree.children.get(arrayField)
        if (!prevValue) {
          typeStructTree.children.set(arrayField, children)
        } else {
          prevValue.type = [...new Set([...children.type, ...prevValue.type])]
        }
      })
      break
    case TypeGroup.Object:
      if (parentTreeMap && !parentTreeMap.get(field)) {
        parentTreeMap.set(field, typeStructTree)
      }
      if (!typeStructTree.children) {
        typeStructTree.children = new Map();
      }

      typeStructTree.type = [...(typeStructTree.type ?? []), TypeGroup.Object]

      Object.keys(target).forEach(key => {
        let typeStructTreeChildren = generatorTypeStructTree(target[key], key, typeStructTree.children)
        const prevValue = typeStructTree.children.get(key)
        if (!prevValue) {
          typeStructTree.children.set(key, typeStructTreeChildren)
        } else {
          prevValue.type = [...new Set([...typeStructTreeChildren.type, ...prevValue.type])]
        }
      })
      break
  }
  return typeStructTree
}

export function parseTypeStructTreeToTsType(typeStructTree: TypeStructTree) {
  const valueList = typeStructTree.type.map(target => {
    switch (target) {
      case TypeGroup.Boolean:
        return 'boolean'
      case TypeGroup.Number:
        return 'number'
      case TypeGroup.String:
        return 'string'
      case TypeGroup.Undefined:
        return 'undefined'
      case TypeGroup.Object:
        let val = '{'
        for (const [key, value] of typeStructTree.children) {
          val += `\n\t${key}: ${parseTypeStructTreeToTsType(value)}`
        }
        val += '\n}'
        return val
      case TypeGroup.Array:
        let arrayVal = []
        for (const [, value] of typeStructTree.children) {
          arrayVal.push(parseTypeStructTreeToTsType(value))
        }
        return `Array<${arrayVal.join(' | ')}>`
    }
    return 'null'
  })

  return [...new Set(valueList)].join(' | ')
}