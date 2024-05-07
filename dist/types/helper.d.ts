export declare const enum TypeGroup {
    String = 0,
    Number = 1,
    Boolean = 2,
    Null = 3,
    Undefined = 4,
    Array = 5,
    Object = 6
}
export interface JsonToTSOptions {
    rootName?: string;
}
export interface TypeStructTree {
    type: TypeGroup[];
    children?: Map<string, TypeStructTree>;
}
