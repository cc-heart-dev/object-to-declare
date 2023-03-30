import { isObject } from "@cc-heart/utils";
import { covertToInterface } from "./convertToInterface";
import type { ITypeStruct, JsonToTSOptions } from "./helper";
import { output } from "./output";
import { getTypeStruct } from "./typeStruct";
import { isArrayObject } from "./utils";

export default function jsonToTsDeclare(target: unknown, options: JsonToTSOptions = {}) {
  const defaultOptions = {
    rootName: 'IRootName',
  }

  if (!isObject(target) && !isArrayObject(target)) {
    throw new Error('target must be object or objectArray')
  }

  const newOption = { ...defaultOptions, ...options }
  const typeStructList: ITypeStruct[] = []
  getTypeStruct(target, typeStructList, newOption.rootName)

  return covertToInterface(output(typeStructList, newOption.rootName, Array.isArray(target)))
}