# object-to-declare

Object-to-Declare is a lightweight utility library that allows developers to easily generate TypeScript type declarations from JavaScript objects or arrays of objects. This can save significant time and effort when writing TypeScript code, especially for large projects or APIs.

## install

You can install` Object-to-Declare` via npm:

```shell
npm install @cc-heart/object-to-declare
```

## Usage

### Basic Usage

To use Object-to-Declare, simply import the library and call the `generateTypeDeclaration` function with the object or array of objects you wish to generate a type declaration for:

```ts
import generateTypeDeclaration from '@cc-heart/object-to-declare'

const myObject = {
  id: 1,
  name: 'John Smith',
  age: 30,
  email: 'john.smith@example.com',
}

const typeDeclaration = generateTypeDeclaration(myObject)

console.log(typeDeclaration)
// Output: interface IRootName {
//   id: number
//   name: string
//   age: number
//   email: string
// }
```
