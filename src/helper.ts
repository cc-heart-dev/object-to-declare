export const enum TypeGroup {
  String,
  Number,
  Boolean,
  Null,
  Undefined,
  Array,
  Object,
  Union
}

export interface JsonToTSOptions {
  rootName?: string
}

export interface TypeStructTree {
  type: TypeGroup[]
  children?: Map<string,TypeStructTree>
}