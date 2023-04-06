export enum TypeGroup {
  Primitive,
  Array,
  Object,
}

export interface JsonToTSOptions {
  rootName?: string
}

export interface ITypeStruct {
  hash: string
  name?: string
  type: TypeGroup
  target: Record<string, string>
}
