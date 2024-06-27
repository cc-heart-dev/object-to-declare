import { describe, test, expect } from 'vitest'
import generateTypeDeclaration from '../src'

describe('generate type when target is object or primitive value', () => {
  test('Generates type declaration for empty object', () => {
    const result = generateTypeDeclaration({}, {})
    expect(result).toBe('interface IRootName  {\n}')
  })

  test('Generates type declaration for simple object', () => {
    const result = generateTypeDeclaration({ name: 'John', age: 30 })
    expect(result).toContain('interface IRootName')
    expect(result).toContain('name: string')
    expect(result).toContain('age: number')
  })

  test('Generates type declaration for deeply nested object', () => {
    const nestedObject = {
      user: {
        name: 'John',
        address: {
          city: 'New York',
          zip: 12345
        }
      }
    }
    const result = generateTypeDeclaration(nestedObject)
    expect(result).toContain('interface IRootName')
    expect(result).toContain('user: {')
    expect(result).toContain('name: string')
    expect(result).toContain('address: {')
    expect(result).toContain('city: string')
    expect(result).toContain('zip: number')
  })

  test('Generates type declaration for complex object array with nested arrays', () => {
    const complexData = [
      {
        id: 1,
        name: 'Alice',
        details: {
          age: 25,
          addresses: null
        }
      },
      {
        id: 2,
        name: 'Bob',
        details: {
          age: 30,
          addresses: [
            { city: 'Chicago', zip: 60601 },
            { city: 'Houston', zip: 77001 }
          ]
        }
      }
    ]

    const result = generateTypeDeclaration(complexData)
    const expectedType = `type IRootName = Array<{
\tid: number
\tname: string
\tdetails: {
\t\tage: number
\t\taddresses: null | Array<{
\t\t\tcity: string
\t\t\tzip: number
\t\t}>
\t}
}>`
    expect(result.trim()).toEqual(expectedType.trim())
  })

  test('should generate optional properties if not present in every object of array', () => {
    const complexData = [{ a: 1 }, { b: '2' }, { c: false }]

    const result = generateTypeDeclaration(complexData)
    const expectedType = `type IRootName = Array<{
\ta?: number
\tb?: string
\tc?: boolean
}>`
    expect(result.trim()).toEqual(expectedType.trim())
  })

  test('should generator Array<unknown> when data is a empty array', () => {
    const complexData = []

    const result = generateTypeDeclaration(complexData)

    expect(result).toBe('type IRootName = Array<unknown>')
  })

  test('attribute should require', () => {
    const complexData = [{ data: [{ a: 1 }] }, { data: [{ a: 1 }] }, { data: [{ a: 1 }] }]

    const result = generateTypeDeclaration(complexData)
    expect(result).toBe(`type IRootName = Array<{
\tdata: Array<{
\t\ta: number
\t}>
}>`)
  })
})
