import { underlineToHump } from '@cc-heart/utils'
import { ITypeStruct } from './helper'
import { isJSON, parseInterface } from './utils'

export function optimizeTypeStructure(target: ITypeStruct[], hash: string, map: Array<string>, cacheTypesName: Set<string> = new Set()) {
  let str = ''
  const data = target.find((item) => item.hash === hash)
  let name = data.name
  if (data) {
    if (cacheTypesName.has(name)) {
      return str
    }
    cacheTypesName.add(name)
    str += `interface ${name} {\n`
    Object.entries(data.target).forEach(([key, value]) => {
      if (value !== null && isJSON(value)) {
        key = underlineToHump(key)
        const subInterface = optimizeTypeStructure(target, value, map, cacheTypesName)
        map.unshift(subInterface)

        const subInterfaceTarget = target.find((_) => _.hash === value)
        if (subInterfaceTarget) {
          let { name } = subInterfaceTarget
          name = parseInterface(name)
          let typeVal
          switch (subInterfaceTarget.type) {
            default:
              typeVal = name
          }
          str += `  ${key}: ${typeVal}\n`
        }
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
