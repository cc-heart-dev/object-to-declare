import type { ITypeStruct } from './helper'
import { isHash } from './utils'

export function optimizeTypeStructure(target: ITypeStruct[], hash: string, map: Array<string>) {
  let str = ''

  const data = target.find((item) => item.hash === hash)
  if (data) {
    str += `interface ${data.name} {\n`
    Object.entries(data.target).forEach(([key, value]) => {
      if (value !== null && isHash(value)) {
        const subInterface = optimizeTypeStructure(target, value, map)
        map.unshift(subInterface)
      } else {
        str += `  ${key}: ${value}\n`
      }
    })
    str += '}'
  }

  return str
}

export function output(target: ITypeStruct[], rootName: string, rootIsArray: boolean) {
  const { hash } = target.find((val) => val.name === rootName)
  const list: Array<string> = []
  const rootInterface = optimizeTypeStructure(target, hash, list)
  list.unshift(rootInterface)

  if (rootIsArray) {
    list.unshift(`type ${rootName}Type = ${rootName}[]\n`)
  }
  return list.reduce((acc, cur) => {
    return acc + (acc ? '\n' : '') + cur
  }, '')
}
