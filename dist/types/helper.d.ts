export declare const enum TypeGroup {
    String = 0,
    Number = 1,
    Boolean = 2,
    Null = 3,
    Undefined = 4,
    Array = 5,
    Object = 6
}
export interface ObjectToDtsOptions {
    rootName?: string;
}
export interface TypeStructTree {
    type: TypeGroup[];
    __array_count?: number;
    __array_keys_map?: Map<string, number>;
    children?: Map<string, TypeStructTree>;
}
export interface GeneratorTypeStructTreeOptions {
    isArrayType?: boolean;
    length?: number;
}
