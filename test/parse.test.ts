import { describe, expect, it } from 'vitest'
import { generatorTypeStructTree, parseTypeStructTreeToTsType } from '../src/parse'
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
