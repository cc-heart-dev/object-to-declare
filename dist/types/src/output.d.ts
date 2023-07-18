import { ITypeStruct } from './helper';
export declare function optimizeTypeStructure(target: ITypeStruct[], hash: string, map: Array<string>, cacheTypesName?: Set<string>): string;
export declare function output(target: ITypeStruct[], rootName: string, rootIsArray: boolean): string;
