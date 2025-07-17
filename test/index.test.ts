import { describe, test, expect, beforeEach } from 'vitest'
import generateTypeDeclaration, { getRegisteredTypes, getTypeInfo } from '../src'

describe('Runtime Type Registration', () => {
  beforeEach(() => {
    // Clear type registry before each test
    const registeredTypes = getRegisteredTypes()
    for (const key of registeredTypes.keys()) {
      registeredTypes.delete(key)
    }
  })

  test('Should handle non-cyclic references correctly', () => {
    const obj = { name: 'test' }
    const result = generateTypeDeclaration(obj, { rootName: 'Simple', collectMetadata: true })
    expect(result).toBe('interface Simple {\n\tname: string\n}')
  })

  test('Should handle multiple cyclic references with type registration', () => {
    const obj1: any = { name: 'obj1' }
    const obj2: any = { name: 'obj2' }
    obj1.ref = obj2
    obj2.ref = obj1

    const result = generateTypeDeclaration(obj1, { rootName: 'MultiCyclic', collectMetadata: true })
    console.log('Generated type declaration:', result)
    expect(result).toContain('interface MultiCyclic')
    expect(result).toContain('ref: {\n\t\tname: string\n\t\tref: MultiCyclic\n\t}')
    expect(result).toContain('name: string')
  })

  test('Should handle cyclic references with type registration', () => {
    const cyclicObj: any = { name: 'root' }
    cyclicObj.self = cyclicObj

    const result = generateTypeDeclaration(cyclicObj, { rootName: 'CyclicType', collectMetadata: true })
    expect(result).toContain('interface CyclicType')
    expect(result).toContain('self: CyclicType')

    const typeInfo = getTypeInfo('CyclicType')
    expect(typeInfo).toBeDefined()
    if (typeInfo) {
      expect(typeInfo.properties.get('self')).toBeDefined()
      expect(typeInfo.properties.get('name')).toBeDefined()
    }
  })

  test('Should handle complex nested arrays with type registration', () => {
    const complexArray = [
      [{ id: 1 }, { id: 2 }],
      [{ id: 3 }]
    ]

    const result = generateTypeDeclaration(complexArray, { rootName: 'NestedArray', collectMetadata: true })
    expect(result).toContain('type NestedArray =')
    expect(result).toContain('Array<Array<')
  })

  test('Should register type metadata for complex object', () => {
    const complexObject = {
      user: {
        name: 'John',
        age: 30,
        contacts: [
          { type: 'email', value: 'john@example.com' },
          { type: 'phone', value: '1234567890' }
        ]
      }
    }

    generateTypeDeclaration(complexObject, { rootName: 'UserProfile', collectMetadata: true })
    
    const typeInfo = getTypeInfo('UserProfile')
    expect(typeInfo).toBeDefined()
    if (typeInfo) {
      expect(typeInfo.name).toBe('UserProfile')
      expect(typeInfo.properties.get('user')).toBeDefined()
    }
    
    const registeredTypes = getRegisteredTypes()
    expect(registeredTypes.size).toBeGreaterThan(0)
    expect(registeredTypes.has('UserProfile')).toBe(true)
    expect(registeredTypes.has('UserProfile_user')).toBe(true)
    expect(registeredTypes.has('UserProfile_user_contactsElement')).toBe(true)
  })

  test('Should not register type metadata when collectMetadata is false', () => {
    const simpleObject = { name: 'Test', value: 123 }
    generateTypeDeclaration(simpleObject, { rootName: 'SimpleType', collectMetadata: false })
    
    const typeInfo = getTypeInfo('SimpleType')
    expect(typeInfo).toBeUndefined()
  })
})

describe('generate type when target is object or primitive value', () => {
  test('Generates type declaration for empty object', () => {
    const result = generateTypeDeclaration({}, {})
    expect(result).toBe('interface IRootName {\n}')
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

  test('should return Array<unknown> when result is empty', () => {
    const complexData = { list: [] }
    expect(generateTypeDeclaration(complexData)).toBe(`interface IRootName {
\tlist: Array<unknown>
}`)
  })
})
