import { type ObjectToDtsOptions } from './helper'
import { deepCloneMarkCycleReference, generatorTypeStructTree, parseTypeStructTreeToTsType, getTypeInfo, registerType, typeRegistry, type TypeMetadata } from './parse.js'
import { isCycleDeps, isCycleName } from './constant.js'

export interface GenerateTypeOptions extends ObjectToDtsOptions {
  collectMetadata?: boolean
}

export default function generateTypeDeclaration(target: unknown, options: GenerateTypeOptions = {}) {
  const defaultOptions = {
    rootName: 'IRootName',
    collectMetadata: true
  }

  options = { ...defaultOptions, ...options }
  const stack = new Map()
  const isObj = typeof target === 'object' && target !== null
  const cloneTarget = isObj ? deepCloneMarkCycleReference(options.rootName, target, stack) : target

  const typeStructTree = generatorTypeStructTree(cloneTarget, options.rootName)
  let typeStr = ''
  if (isObj) {
    typeStr = [...stack.entries()]
      .filter(([_]) => {
        return _ && _ !== target && Reflect.get(_, isCycleDeps)
      })
      .map(([t]) => {
        const rootName = Reflect.get(t, isCycleName)
        if (!rootName) return ''
        return generateTypeDeclaration(t, {
          ...options,
          rootName
        })
      })
      .join('\n')

    if (typeStr) typeStr += '\n'
  }

  const declareType = target !== null && typeof target === 'object' && !Array.isArray(target) ? 'interface' : 'type'
  const declaration = (
    `${typeStr}${declareType} ${options.rootName}${declareType === 'interface' ? '' : ' ='} ` +
    parseTypeStructTreeToTsType(typeStructTree, 1, options.collectMetadata ? options.rootName : undefined)
  )

  return declaration
}

export function getRegisteredTypes(): Map<string, TypeMetadata> {
  const types = new Map<string, TypeMetadata>()
  for (const [name, metadata] of typeRegistry.entries()) {
    types.set(name, { ...metadata })
  }
  return types
}

export { getTypeInfo, registerType }
export type { TypeMetadata }

export * from './version.js'
