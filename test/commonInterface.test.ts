import { expect, describe, it } from 'vitest'
import { JsonToTSOptions } from '../src/helper'
import jsonToTsDeclare from '../src/index'
describe('Common interface', () => {
  it('should be defined', () => {
    const target = {
      num: 0,
      str: '',
      bool: true,
      non: null,
      undef: void 0
    }
    expect(jsonToTsDeclare(target)).toEqual(`interface IRootName {
  num: number
  str: string
  bool: boolean
  non: null
  undef: undefined
}`)
  })

  it('should interface name is inter when rootName is inter', () => {
    const target = {
      foo: 1,
      bar: '1'
    }
    const options: JsonToTSOptions = {
      rootName: 'inter'
    }

    expect(jsonToTsDeclare(target, options)).toEqual(`interface inter {
  foo: number
  bar: string
}`)
  })


  it('should throw error when target is unObject', () => {
    const target = 1
    expect(() => jsonToTsDeclare(target)).toThrowError('target must be object or objectArray')
  })

  it('should throw error when target is unObjectArray', () => {
    const target = [1]
    expect(() => jsonToTsDeclare(target)).toThrowError('target must be object or objectArray')
  })
})