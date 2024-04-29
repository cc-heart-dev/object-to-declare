import { TypeStructTree } from "./helper";
export declare function generatorTypeStructTree(target: unknown, field: string, parentTreeMap?: Map<string, TypeStructTree>): TypeStructTree;
export declare function parseTypeStructTreeToTsType(typeStructTree: TypeStructTree): string;
