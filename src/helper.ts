export const enum TypeGroup {
  String,
  Number,
  Boolean,
  Null,
  Undefined,
  Array,
  Object

}

export interface JsonToTSOptions {
  rootName?: string
}

export interface ITypeStruct {
  field: string | symbol
  type: TypeGroup,
  declares?: 'type' | 'interface'
  target?: ITypeStruct[]
}
