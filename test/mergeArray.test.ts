import { describe, expect, it } from 'vitest'
import jsonToTsDeclare from '../src'

describe('Interface for merging arrays', () => {
  it('should return defined when target is array', () => {
    const target = [
      { label: 'kk', value: 1 },
      { label: 'dd', value: 2 },
    ]

    expect(jsonToTsDeclare(target)).toEqual(`type IRootNameType = IRootName[]

interface IRootName {
  label: string
  value: number
}`)
  })
})
