import { describe, expect, it } from 'vitest'
import { getHashByObject, isArrayObject, isJSON, isValidPropertyName, parseInterface } from '../src/utils'

describe('valid property name', () => {
  it('It is legal to contain only English or numbers', () => {
    expect(isValidPropertyName('a')).toBeTruthy()
    expect(isValidPropertyName('123')).toBeTruthy()
  })

  it('It is not legal to include special characters', () => {
    expect(isValidPropertyName('a-b')).toBeFalsy()
    expect(isValidPropertyName('@asd')).toBeFalsy()
  })
})

describe('parseInterface func', () => {
  it('parse interface name', () => {
    expect(parseInterface('foo_bar')).toBe('Foo_Bar')
  })

  it('ignore parse number', () => {
    expect(parseInterface('foo_123')).toBe('Foo_123')
  })

  it('ignore special characters', () => {
    expect(parseInterface('foo_@_3_-_131_')).toBe('Foo___Valid_3___Valid_131_')
  })
})

describe('isArrayObject func', () => {
  it('should return a false when array is number array', () => {
    expect(isArrayObject([1, 2, 3])).toBeFalsy()
  })

  it('should return true when array is object array', () => {
    expect(isArrayObject([{ a: 1 }, { b: 2 }, { c: 3 }])).toBeTruthy()
  })

  it('should return false when target is object', () => {
    expect(isArrayObject({ a: 1 })).toBeFalsy()
  })
})

describe('utils module', () => {
  it('should return a json string when invoke getHashByObject func', () => {
    expect(getHashByObject({ data: 1 })).toBe('{"data":1}')
  })

  it('should return true when invoke isJSON func', () => {
    expect(isJSON('{"data":1}')).toBeTruthy()
  })
})
