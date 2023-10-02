import { type ITypeStruct, TypeGroup } from './helper';
export declare function getTypeGroup(target: unknown): TypeGroup;
export declare function getTypeStruct(targetObj: unknown, typeStructList?: ITypeStruct[], name?: string, type?: TypeGroup, isRootName?: boolean): any;
