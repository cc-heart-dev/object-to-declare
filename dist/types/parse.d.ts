import { TypeStructTree } from './helper';
export declare function generatorTypeStructTree(target: unknown, field: string | symbol, parentTreeMap?: Map<string | symbol, TypeStructTree>): TypeStructTree;
export declare function parseTypeStructTreeToTsType(typeStructTree: TypeStructTree, space?: number): string;
