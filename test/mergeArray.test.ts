import { describe, expect, it } from 'vitest'
import generateTypeDeclaration from '../src'

describe('Interface for merging arrays', () => {
  it('should return defined when target is array', () => {
    const target = [
      { label: 'kk', value: 1 },
      { label: 'dd', value: 2 },
    ]

    expect(generateTypeDeclaration(target)).toEqual(`type IRootNameType = IRootName[]

interface IRootName {
  label: string
  value: number
}`)
  })
})
