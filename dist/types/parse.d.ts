import { type GeneratorTypeStructTreeOptions, TypeStructTree } from './helper';
export declare function generatorTypeStructTree(target: unknown, field: string | symbol, parentTreeMap?: Map<string | symbol, TypeStructTree>, options?: GeneratorTypeStructTreeOptions): TypeStructTree;
export declare function parserKey(key: string): string;
export declare function parseTypeStructTreeToTsType(typeStructTree: TypeStructTree, space?: number): string;
