// import JsonToTS from 'json-to-ts'
// import { underlineToHump } from '@cc-heart/utils'
// const json = {
//   id: 1,
//   examPaperId: 17,
//   userId: 16,
//   courseId: 1,
//   answerList: [
//     {
//       answer: "a04w6DmwwJIBuaWDkBeyF",
//       id: 9,
//     },
//     {
//       answer: "lRFx4a7TvyIHJ8RjHmvB1",
//       id: -1,
//     },
//     {
//       answer: "Iy7Avm90F14WjS15GL8is",
//       id: 15,
//     },
//     {
//       answer: "<p>21331</p>",
//       id: 16,
//     },
//   ],
//   status: 0,
//   score: 2,
// }
// const underlineToCamel = <T extends Record<string, unknown>>(target: T | Array<T>) => {
//   if (Array.isArray(target)) {
//     return target.map(val => {
//       return underlineToCamel(val)
//     })
//   } else {
//     return Object.keys(target).reduce((acc, cur) => {
//       const key = underlineToHump(cur)
//       Reflect.set(acc, key, target[cur])
//       return acc
//     }, {})
//   }
// }
// // JsonToTs 有两个配置参数 第二个配置参数
// /**
//  * {
//  *  rootName: string
//  * }
//  */
// debugger
// JsonToTS(underlineToCamel(json)).forEach(typeInterface => {
//   console.log(typeInterface)
// })

