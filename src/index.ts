import { isObject } from '@cc-heart/utils'
import { type ObjectToDtsOptions } from './helper'
import { deepCloneMarkCycleReference, generatorTypeStructTree, parseTypeStructTreeToTsType } from './parse.js'
import { isCycleDeps, isCycleName } from './constant.js'

export default function generateTypeDeclaration(target: unknown, options: ObjectToDtsOptions = {}) {
  const defaultOptions = {
    rootName: 'IRootName'
  }

  options = { ...defaultOptions, ...options }
  const stack = new Map()
  const isObj = typeof target === 'object' && target !== null
  const cloneTarget = isObj ? deepCloneMarkCycleReference(options.rootName, target, stack) : target

  const typeStructTree = generatorTypeStructTree(cloneTarget, options.rootName);
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
      }).join('\n')

    if (typeStr) typeStr += '\n'
  }

  const declareType = isObject(cloneTarget) ? 'interface' : 'type'
  return `${typeStr}${declareType} ${options.rootName} ${declareType === 'interface' ? '' : '='} ` + parseTypeStructTreeToTsType(typeStructTree)
}

export * from './version.js'