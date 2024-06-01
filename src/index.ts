import { isObject } from '@cc-heart/utils'
import { type ObjectToDtsOptions } from './helper'
import { generatorTypeStructTree, parseTypeStructTreeToTsType } from './parse.js'

export default function generateTypeDeclaration(target: unknown, options: ObjectToDtsOptions = {}) {
  const defaultOptions = {
    rootName: 'IRootName'
  }

  options = { ...defaultOptions, ...options }

  const typeStructTree = generatorTypeStructTree(target, options.rootName)

  const declareType = isObject(target) ? 'interface' : 'type'
  return `${declareType} ${options.rootName} ${declareType === 'interface' ? '' : '='} ` + parseTypeStructTreeToTsType(typeStructTree)
}

export * from './version'
