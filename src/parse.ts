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
export function generatorTypeStructTree(target: unknown, field: string, typeStructTreeMap: Map<string, TypeStructTree>) {
  const isExistTypeStructTreeInMap = typeStructTreeMap.has(field)
  const typeStructTree = isExistTypeStructTreeInMap ? typeStructTreeMap.get(field) : {
    field,
    type: [TypeGroup.Null],
  }
  let oldTypeStructType = []
  if (isExistTypeStructTreeInMap) {
    oldTypeStructType = [...typeStructTree.type]
  }
  switch (parseValueMapTypeGroup(target)) {
    case TypeGroup.String:
      typeStructTree.type = [TypeGroup.String]
      break
    case TypeGroup.Number:
      typeStructTree.type = [TypeGroup.Number]
      break
    case TypeGroup.Boolean:
      typeStructTree.type = [TypeGroup.Boolean]
      break
    case TypeGroup.Null:
      typeStructTree.type = [TypeGroup.Null]
      break
    case TypeGroup.Undefined:
      typeStructTree.type = [TypeGroup.Undefined]
      break
    case TypeGroup.Array:
      typeStructTree.type = [TypeGroup.Array]
      if (!Array.isArray(typeStructTree.children)) {
        typeStructTree.children = [];
      }
      (target as Array<unknown>).forEach(item => {
        const typeStructTreeChildren = generatorTypeStructTree(item, `${field}__children`, typeStructTreeMap)
        typeStructTreeChildren.type = [...new Set(typeStructTreeChildren.type.map(_ => _ === TypeGroup.Object ? TypeGroup.Union : _))]
        typeStructTree.children.push(typeStructTreeChildren)
      })
      break
    case TypeGroup.Object:
      typeStructTreeMap.set(field, typeStructTree)
      typeStructTree.type = [TypeGroup.Object]
      if (!Array.isArray(typeStructTree.children)) {
        typeStructTree.children = [];
      }
      Object.keys(target).forEach(key => {
        const typeStructTreeChildren = generatorTypeStructTree(target[key], key, typeStructTreeMap)
        typeStructTree.children.push(typeStructTreeChildren)
      })
      break
  }
  typeStructTree.type = [...new Set([...oldTypeStructType, ...typeStructTree.type])]
  return typeStructTree
}