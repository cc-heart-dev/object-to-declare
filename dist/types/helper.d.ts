export declare enum TypeGroup {
    Primitive = 0,
    Array = 1,
    Object = 2
}
export interface JsonToTSOptions {
    rootName?: string;
}
export interface ITypeStruct {
    hash: string;
    name?: string;
    type: TypeGroup;
    target: Record<string, string>;
}
