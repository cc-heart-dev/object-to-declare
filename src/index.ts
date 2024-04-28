import { TypeStructTree, type JsonToTSOptions } from './helper'
import { generatorTypeStructTree } from './parse.js'
import { inspect } from 'util'
export default function generateTypeDeclaration(target: unknown, options: JsonToTSOptions = {}) {
  const defaultOptions = {
    rootName: 'IRootName',
  }

  options = { ...defaultOptions, ...options }

  const typeStructTreeMap = new Map<string, TypeStructTree>()
  const val = generatorTypeStructTree(target, options.rootName, typeStructTreeMap)

  console.log(inspect(typeStructTreeMap, { showHidden: false, depth: null }))
  return val
  // const typeMap = new Map<>
  // const structAst = getTypeStruct(target, options.rootName)
  // return parseTypeStruct(structAst)
}

const complexData: Record<string, any> = {
  friends: [
    {
      hobbies: ['Swimming', 'Painting', 1]
    },
    {
      hobbies: ['Hiking', 'Photography']
    }
  ]
};

inspect(generateTypeDeclaration(complexData), { showHidden: false, depth: null })
