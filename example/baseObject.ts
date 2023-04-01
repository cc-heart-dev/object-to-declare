import generateTypeDeclaration from '../dist/esm/index.js'

const myObject = {
  id: 1,
  name: 'John Smith',
  age: 30,
  email: 'john.smith@example.com',
}

const typeDeclaration = generateTypeDeclaration(myObject)

console.log(typeDeclaration)
// Output: interface IRootName {
//    id: number
//    name: string
//    age: number
//    email: string
// }
