import { type JsonToTSOptions } from './helper'
import { getTypeStruct, parseTypeStruct } from './typeStruct.js'
export default function generateTypeDeclaration(target: unknown, options: JsonToTSOptions = {}) {
  const defaultOptions = {
    rootName: 'IRootName',
  }

  const newOption = { ...defaultOptions, ...options }
  const structAst = getTypeStruct(target, newOption.rootName)
  return parseTypeStruct(structAst)
}
