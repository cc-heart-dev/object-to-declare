export const enum TypeGroup {
  String,
  Number,
  Boolean,
  Null,
  Undefined,
  Array,
  Object
}

export interface ObjectToDtsOptions {
  rootName?: string
}

export interface TypeStructTree {
  type: TypeGroup[]
  __array_count?: number
  __array_keys_map?: Map<string, number>
  children?: Map<string, TypeStructTree>
}

export interface GeneratorTypeStructTreeOptions {
  isArrayType?: boolean
  length?: number
}
