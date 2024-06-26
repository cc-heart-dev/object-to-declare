import { isNull } from '@cc-heart/utils'
import { type GeneratorTypeStructTreeOptions, TypeGroup, TypeStructTree } from './helper'

function parseValueMapTypeGroup(target: unknown) {
  const typeMap = {
    string: TypeGroup.String,
    undefined: TypeGroup.Undefined,
    number: TypeGroup.Number,
    boolean: TypeGroup.Boolean,
    object: TypeGroup.Object
  }

  const targetType = typeof target
  if (Array.isArray(target)) return TypeGroup.Array
  if (isNull(target)) return TypeGroup.Null
  return typeMap[targetType]
}

function mergeTreeType(currentType: TypeGroup, typeStructTree: TypeStructTree | undefined) {
  return [...typeStructTree.type, currentType]
}

function recursiveChildrenGenerateType(target: unknown, field: string, typeStructTree: TypeStructTree, options?: GeneratorTypeStructTreeOptions) {
  const children = generatorTypeStructTree(target, field, typeStructTree.children, options)
  let existChildrenTarget = typeStructTree.children.get(field)
  if (!existChildrenTarget) {
    typeStructTree.children.set(field, children)
    existChildrenTarget = children
  } else {
    existChildrenTarget.type = [...new Set([...children.type, ...existChildrenTarget.type])]
  }

  if (options && options.isArrayType) {
    let count = 0
    if (!existChildrenTarget.__array_count) {
      existChildrenTarget.__array_keys_map = new Map()
    } else {
      count = existChildrenTarget.__array_keys_map.get(field)
    }
    count++
    existChildrenTarget.__array_keys_map.set(field, count)

    existChildrenTarget.__array_count = options.length
  }
}

export function generatorTypeStructTree(
  target: unknown,
  field: string | symbol,
  parentTreeMap?: Map<string | symbol, TypeStructTree>,
  options?: GeneratorTypeStructTreeOptions
) {
  let typeStructTree: TypeStructTree = parentTreeMap?.get(field) ?? {
    type: []
  }

  switch (parseValueMapTypeGroup(target)) {
    case TypeGroup.String:
      typeStructTree.type = mergeTreeType(TypeGroup.String, typeStructTree)
      break
    case TypeGroup.Number:
      typeStructTree.type = mergeTreeType(TypeGroup.Number, typeStructTree)
      break
    case TypeGroup.Boolean:
      typeStructTree.type = mergeTreeType(TypeGroup.Boolean, typeStructTree)
      break
    case TypeGroup.Undefined:
      typeStructTree.type = mergeTreeType(TypeGroup.Undefined, typeStructTree)
      break
    case TypeGroup.Array:
      if (!typeStructTree.children) {
        typeStructTree.children = new Map()
      }
      typeStructTree.type = mergeTreeType(TypeGroup.Array, typeStructTree)

      const arrayChildrenField = `${String(field)}__$$children`

        ; (target as Array<unknown>).forEach((item, _, arr) => {
          recursiveChildrenGenerateType(item, arrayChildrenField, typeStructTree, {
            ...options,
            isArrayType: true,
            length: arr.length
          })
        })
      break
    case TypeGroup.Object:
      if (parentTreeMap && !parentTreeMap.get(field)) {
        parentTreeMap.set(field, typeStructTree)
      }

      if (!typeStructTree.children) {
        typeStructTree.children = new Map<string, TypeStructTree>()
      }

      typeStructTree.type = mergeTreeType(TypeGroup.Object, typeStructTree)

      Object.keys(target).forEach((key) => {
        recursiveChildrenGenerateType(target[key], key, typeStructTree, options)
      })
      break
    default:
      typeStructTree.type = mergeTreeType(TypeGroup.Null, typeStructTree)
  }
  return typeStructTree
}

function generateSpace(space: number) {
  let ret = ''
  for (let i = 0; i < space; i++) {
    ret += '\t'
  }
  return ret
}

export function parserKey(key: string) {
  const validIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/
  if (validIdentifier.test(key)) return key

  return `'${key}'`
}

function generateParticleType(field: string, typeStructTree: TypeStructTree) {
  if (typeStructTree.__array_keys_map) {
    const count = typeStructTree.__array_keys_map.get(field)
    if (count === typeStructTree.__array_count) return ''

    return '?'
  }
  return ''
}

export function parseTypeStructTreeToTsType(typeStructTree: TypeStructTree, space = 1) {
  const valueList = typeStructTree.type.map((target) => {
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
        const childrenObjectSpace = space + 1
        for (const [key, value] of typeStructTree.children) {
          val += `\n${generateSpace(space)}${parserKey(String(key))}${generateParticleType(key, value)}: ${parseTypeStructTreeToTsType(value, childrenObjectSpace)}`
        }
        val += `\n${generateSpace(space - 1)}}`
        return val
      case TypeGroup.Array:
        let arrayVal = []
        const childrenArraySpace = space + 1
        for (const [, value] of typeStructTree.children) {
          const childrenSpace = typeof value === 'object' && value !== null ? space : childrenArraySpace
          arrayVal.push(parseTypeStructTreeToTsType(value, childrenSpace))
        }
        const arrayType = arrayVal.length === 0 ? 'unknown' : arrayVal.join(' | ')
        return `Array<${arrayType}>`
    }
    return 'null'
  })

  return [...new Set(valueList)].join(' | ')
}
