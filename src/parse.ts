import { isNull } from '@cc-heart/utils'
import { type GeneratorTypeStructTreeOptions, TypeGroup, TypeStructTree } from './helper'
import { isCycleDeps, isCycleName } from './constant.js'

export interface RuntimeTypeInfo {
  type: string
  isOptional: boolean
  description?: string
}

export interface TypeMetadata {
  name: string
  properties: Map<string, RuntimeTypeInfo>
  extends?: string[]
}

export const typeRegistry = new Map<string, TypeMetadata>()

export function registerType(name: string, metadata: TypeMetadata) {
  typeRegistry.set(name, metadata)
}

export function getTypeInfo(name: string): TypeMetadata | undefined {
  return typeRegistry.get(name)
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseValueMapTypeGroup(target: unknown) {
  const typeMap = {
    string: TypeGroup.String,
    undefined: TypeGroup.Undefined,
    number: TypeGroup.Number,
    boolean: TypeGroup.Boolean,
    object: TypeGroup.Object
  }

  if (typeof target === 'string' && target.startsWith('__$$__')) {
    return TypeGroup.Cycle
  }

  const targetType = typeof target

  if (Array.isArray(target)) return TypeGroup.Array
  if (isNull(target)) return TypeGroup.Null
  return typeMap[targetType]
}

function mergeTreeType(currentType: TypeGroup, typeStructTree: TypeStructTree | undefined) {
  return [...typeStructTree.type, currentType]
}

export function recursiveChildrenGenerateType(
  target: unknown,
  field: string,
  typeStructTree: TypeStructTree,
  options?: GeneratorTypeStructTreeOptions
) {
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
    case TypeGroup.Cycle:
      typeStructTree.type = mergeTreeType(TypeGroup.Cycle, {
        type: [(target as string).split('__$$__')[1] as unknown as TypeGroup]
      })
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

      ;(target as Array<unknown>).forEach((item, _, arr) => {
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

export function generateParticleType(field: string, typeStructTree: TypeStructTree) {
  if (typeStructTree.__array_keys_map) {
    const count = typeStructTree.__array_keys_map.get(field)

    if (count < typeStructTree.__array_count) return '?'
  }
  return ''
}

export function parseTypeStructTreeToTsType(typeStructTree: TypeStructTree, space = 1, typeName?: string) {
  const valueList = typeStructTree.type.map((target, index) => {
    switch (target) {
      case TypeGroup.Boolean:
        return 'boolean'
      case TypeGroup.Number:
        return 'number'
      case TypeGroup.String:
        return 'string'
      case TypeGroup.Undefined:
        return 'undefined'
      case TypeGroup.Cycle:
        return ''
      case TypeGroup.Object: {
        let val = '{'
        const childrenObjectSpace = space + 1
        const metadata: TypeMetadata = {
          name: typeName || 'Anonymous',
          properties: new Map()
        }

        for (const [key, value] of typeStructTree.children) {
          const propertyType = parseTypeStructTreeToTsType(value, childrenObjectSpace, `${typeName}_${key}`)
          const isOptional = generateParticleType(key, value) === '?'
          metadata.properties.set(key, {
            type: propertyType,
            isOptional,
            description: `Auto-generated from runtime type analysis`
          })
          val += `\n${generateSpace(space)}${parserKey(String(key))}${isOptional ? '?' : ''}: ${propertyType}`
        }
        val += `\n${generateSpace(space - 1)}}` 

        if (typeName) {
          registerType(typeName, metadata)
        }
        return val
      }
      case TypeGroup.Array: {
        let arrayVal = []
        const childrenArraySpace = space + 1
        for (const [, value] of typeStructTree.children) {
          const childrenSpace = typeof value === 'object' && value !== null ? space : childrenArraySpace
          const elementTypeName = typeName ? `${typeName}Element` : undefined
          arrayVal.push(parseTypeStructTreeToTsType(value, childrenSpace, elementTypeName))
        }
        const arrayType = arrayVal.length === 0 ? 'unknown' : arrayVal.join(' | ')
        return `Array<${arrayType}>`
      }
    }

    if (typeof target === 'string' && typeStructTree.type.length === 2) {
      return capitalize((typeStructTree.type[index] as unknown as string) || '') || 'unknown'
    }
    return 'null'
  })

  return [...new Set(valueList)].filter(Boolean).join(' | ')
}

export function deepCloneMarkCycleReference(key: string, target: unknown, stack: Map<unknown, string> = new Map()) {
  if (typeof target === 'object' && !isNull(target)) {
    if (stack.has(target)) {
      const cycleKey = stack.get(target)
      Reflect.set(target, isCycleDeps, true)
      Reflect.set(target, isCycleName, cycleKey)
      return '__$$__' + cycleKey
    } else {
      stack.set(target, key)
    }

    if (Array.isArray(target)) {
      return target.map((r) => deepCloneMarkCycleReference(`${key}Child`, r, stack))
    } else if (isObject(target)) {
      return Object.keys(target).reduce((acc, targetKey) => {
        let value = target[targetKey]
        if (typeof value === 'object') {
          value = deepCloneMarkCycleReference(targetKey, value, stack)
        }
        acc[targetKey] = value
        return acc
      }, {})
    }
  }
  return target
}
