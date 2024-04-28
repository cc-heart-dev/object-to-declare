// import { expect, describe, it } from 'vitest'
// import { JsonToTSOptions } from '../src/helper'
// import generateTypeDeclaration from '../src/index'

// describe('Common interface', () => {
//   it('should be defined', () => {
//     const target = {
//       num: 0,
//       str: '',
//       bool: true,
//       non: null,
//       undef: void 0,
//     }
//     expect(generateTypeDeclaration(target)).toEqual(`interface IRootName {
//   num: number
//   str: string
//   bool: boolean
//   non: null
//   undef: undefined
// }`)
//   })

//   it('should interface name is inter when rootName is inter', () => {
//     const target = {
//       foo: 1,
//       bar: '1',
//     }
//     const options: JsonToTSOptions = {
//       rootName: 'inter',
//     }

//     expect(generateTypeDeclaration(target, options)).toEqual(`interface inter {
//   foo: number
//   bar: string
// }`)
//   })

//   it('should throw error when target is unObject', () => {
//     const target = 1
//     expect(() => generateTypeDeclaration(target)).toThrowError('target must be object or objectArray')
//   })

//   it('should throw error when target is unObjectArray', () => {
//     const target = [1]
//     expect(() => generateTypeDeclaration(target)).toThrowError('target must be object or objectArray')
//   })

//   it('Ignore repetitive dependencies when there are identical data objects', () => {
//     const target = {
//       sign: { url: 'https' },
//       lotto: {
//         url: 'https',
//       },
//     }
//     expect(generateTypeDeclaration(target)).toEqual(`interface IRootName {
//   sign: Sign_Lotto
//   lotto: Sign_Lotto
// }

// interface Sign_Lotto {
//   url: string
// }`)
//   })
// })

// describe('Interface for merging arrays', () => {
//   it('should return defined when target is array', () => {
//     const target = [
//       { label: 'kk', value: 1 },
//       { label: 'dd', value: 2 },
//     ]

//     expect(generateTypeDeclaration(target)).toEqual(`type IRootNameType = IRootName[]

// interface IRootName {
//   label: string
//   value: number
// }`)
//   })
// })

// describe('object to declare', () => {
//   it('should return two interface when target is complex object', () => {
//     const target = {
//       mysql: {
//         type: 'mysql',
//         database: 'pic',
//         username: 'root',
//         password: '123456',
//         host: 'localhost',
//         logging: true,
//         port: 3306,
//       },
//     }
//     expect(generateTypeDeclaration(target)).toEqual(
//       `interface IRootName {
//   mysql: Mysql
// }
// interface Mysql {
//   type: string
//   database: string
//   username: string
//   password: string
//   host: string
//   logging: boolean
//   port: number
// }`,
//     )
//   })
// })

// describe('object container array', () => {
//   it('should return two interface when target is complex object', () => {
//     const target = {
//       data: [{ a: 1 }, { b: 2 }, { c: 3 }],
//       num: 1,
//       foo: {
//         bar: 2,
//       },
//       result: [1, 2, 3],
//       empty: [],
//     }
//     expect(generateTypeDeclaration(target)).toBe(`interface IRootName {
//   data: ({"a":"number"} | {"b":"number"} | {"c":"number"})[]
//   num: number
//   foo: Foo
//   result: number[]
//   empty: []
// }
// interface Foo {
//   bar: number
// }`)
//   })
// })

// describe('valid property name', () => {
//   it('should return true when invoke isJSON func', () => {
//     const target = {
//       200: 123,
//       'foo-bar': 123,
//     }
//     expect(generateTypeDeclaration(target)).toBe(`interface IRootName {
//   200: number
//   'foo-bar': number
// }`)
//   })
// })
