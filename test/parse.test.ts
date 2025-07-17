import { describe, expect, it } from 'vitest'
import { deepCloneMarkCycleReference, generatorTypeStructTree, parseTypeStructTreeToTsType, recursiveChildrenGenerateType, generateParticleType, getTypeInfo } from '../src/parse'
import { TypeGroup } from '../src/helper'


describe('generatorTypeStructTree', () => {
  it('should generate correct type structure tree for simple object', () => {
    const inputObject = {
      field1: 'string',
      field2: 123,
      field3: true,
      field4: undefined,
      field5: [1, 2, 3],
      field6: {
        nestedField1: 'nestedString',
        nestedField2: 456,
        nestedField3: true,
        nestedField4: undefined,
        nestedField5: [7, 8, 9]
      },
      field7: null
    }

    const expectedTypeStructureTree = {
      type: [TypeGroup.Object],
      children: new Map([
        ['field1', { type: [TypeGroup.String] }],
        ['field2', { type: [TypeGroup.Number] }],
        ['field3', { type: [TypeGroup.Boolean] }],
        ['field4', { type: [TypeGroup.Undefined] }],
        [
          'field5',
          {
            type: [TypeGroup.Array],
            children: new Map([
              [
                'field5__$$children',
                {
                  type: [TypeGroup.Number],
                  __array_keys_map: new Map([['field5__$$children', 3]]),
                  __array_count: 3
                }
              ]
            ])
          }
        ],
        [
          'field6',
          {
            type: [TypeGroup.Object],
            children: new Map([
              ['nestedField1', { type: [TypeGroup.String] }],
              ['nestedField2', { type: [TypeGroup.Number] }],
              ['nestedField3', { type: [TypeGroup.Boolean] }],
              ['nestedField4', { type: [TypeGroup.Undefined] }],
              [
                'nestedField5',
                {
                  type: [TypeGroup.Array],
                  children: new Map([
                    [
                      'nestedField5__$$children',
                      {
                        type: [TypeGroup.Number],
                        __array_keys_map: new Map([['nestedField5__$$children', 3]]),
                        __array_count: 3
                      }
                    ]
                  ])
                }
              ]
            ])
          }
        ],
        ['field7', { type: [TypeGroup.Null] }]
      ])
    }

    expect(generatorTypeStructTree(inputObject, 'root', new Map())).toEqual(expectedTypeStructureTree)
  })
})

describe('parseTypeStructTreeToTsType', () => {
  it('should handle empty type array', () => {
    const typeStructTree = { type: [] }
    expect(parseTypeStructTreeToTsType(typeStructTree)).toBe('')
  })


  it('should handle object with type metadata', () => {
    const typeStructTree = {
      type: [TypeGroup.Object],
      children: new Map([
        ['test', { type: [TypeGroup.String] }]
      ])
    }
    const result = parseTypeStructTreeToTsType(typeStructTree, 1, 'TestType')
    expect(result).toContain('test: string')
    const typeInfo = getTypeInfo('TestType')
    expect(typeInfo).toBeDefined()
  })

  it('should return correct TypeScript type for a simple object', () => {
    const typeStructTree = {
      type: [TypeGroup.String, TypeGroup.Number, TypeGroup.Boolean, TypeGroup.Undefined, TypeGroup.Null]
    }

    expect(parseTypeStructTreeToTsType(typeStructTree)).toBe('string | number | boolean | undefined | null')
  })

  it('should return correct TypeScript type for a nested object', () => {
    const typeStructTree = {
      type: [TypeGroup.Object],
      children: new Map([
        [
          'field1',
          {
            type: [TypeGroup.String, TypeGroup.Number]
          }
        ]
      ])
    }

    expect(parseTypeStructTreeToTsType(typeStructTree)).toBe('{\n\tfield1: string | number\n}')
  })

  it('should return correct TypeScript type for an array', () => {
    const typeStructTree = {
      type: [TypeGroup.Array],
      children: new Map([
        [
          '__$$children',
          {
            type: [TypeGroup.String, TypeGroup.Number],
            children: new Map()
          }
        ]
      ])
    }

    expect(parseTypeStructTreeToTsType(typeStructTree)).toBe('Array<string | number>')
  })

  it('should return single quotes wrapper key when the key does not conform to the JS specification', () => {
    const typeStructTree = {
      type: [TypeGroup.Object],
      children: new Map([
        ['nestedField 1', { type: [TypeGroup.String] }],
        ['123asd', { type: [TypeGroup.Number] }],
        ['asd_1', { type: [TypeGroup.Boolean] }],
        ['asd_1__$1', { type: [TypeGroup.Undefined] }]
      ])
    }

    expect(parseTypeStructTreeToTsType(typeStructTree)).toBe(`{
\t'nestedField 1': string
\t'123asd': number
\tasd_1: boolean
\tasd_1__$1: undefined
}`)
  })
})

describe('parseValueMapTypeGroup and mergeTreeType', () => {
  it('should handle undefined values correctly', () => {
    const result = generatorTypeStructTree(undefined, 'test')
    expect(result.type).toContain(TypeGroup.Undefined)
  })

  it('should handle string values with __$$__ prefix', () => {
    const result = generatorTypeStructTree('__$$__TestType', 'test')
    expect(result.type).toContain(TypeGroup.Cycle)
  })
})

describe('recursiveChildrenGenerateType', () => {
  it('should handle array type options correctly', () => {
    const typeStructTree = {
      type: [],
      children: new Map()
    }
    const target = [1, 2, 3]
    recursiveChildrenGenerateType(target, 'test', typeStructTree, {
      isArrayType: true,
      length: target.length
    })
    const child = typeStructTree.children.get('test')
    expect(child.__array_count).toBe(3)
    expect(child.__array_keys_map.get('test')).toBe(1)
  })

  it('should merge types when child already exists', () => {
    const typeStructTree = {
      type: [],
      children: new Map([['test', { type: [TypeGroup.String] }]])
    }
    recursiveChildrenGenerateType(123, 'test', typeStructTree)
    const child = typeStructTree.children.get('test')
    expect(child!.type).toContain(TypeGroup.String)
    expect(child!.type).toContain(TypeGroup.Number)
  })
})

describe('generateParticleType', () => {
  it('should return ? for partial array items', () => {
    const typeStructTree = {
      type: [TypeGroup.Array],
      __array_count: 3,
      __array_keys_map: new Map([['field', 2]])
    }
    expect(generateParticleType('field', typeStructTree)).toBe('?')
  })

  it('should return empty string for complete array items', () => {
    const typeStructTree = {
      type: [TypeGroup.Array],
      __array_count: 3,
      __array_keys_map: new Map([['field', 3]])
    }
    expect(generateParticleType('field', typeStructTree)).toBe('')
  })
})

describe('cycle deps', () => {
  it('deepCloneMarkCycleReference', () => {
    const obj = {
      a: 1,
      b: '2',
      c: null
    }

    // @ts-expect-error
    obj.c = obj

    const stack = new Map()
    const result = deepCloneMarkCycleReference('root', obj, stack)
    expect(result).toEqual({
      a: 1,
      b: '2',
      c: '__$$__root'
    })
    expect(stack.has(obj)).toBeTruthy()
  })

  it('should return value when target is simple data structure', () => {
    expect(deepCloneMarkCycleReference('root', 'key')).toBe('key')
  })

  it('array object cycle deps', () => {
    const obj = { a: 1, b: '2', c: null }

    // @ts-expect-error
    obj.c = obj

    const list = [obj]
    // @ts-ignore
    list.push(list)

    const stack = new Map()
    expect(deepCloneMarkCycleReference('root', list, stack)).toEqual([
      { a: 1, b: '2', c: '__$$__rootChild' },
      '__$$__root'
    ])
  })
})
