import { describe, expect, test } from "vitest";
import { ITypeStruct, TypeGroup } from "../src/helper";
import { getTypeStruct, parseTypeStruct } from "../src/typeStruct";


describe('getTypeStruct func', () => {
  test('getTypeStruct - string type', () => {
    const result = getTypeStruct('Hello', 'testField');
    expect(result.type).toBe(TypeGroup.String);
  });

  test('getTypeStruct - number type', () => {
    const result = getTypeStruct(42, 'testField');
    expect(result.type).toBe(TypeGroup.Number);
  });

  test('getTypeStruct - undefined type', () => {
    const result = getTypeStruct(undefined, 'testField');
    expect(result.type).toBe(TypeGroup.Undefined);
  });

  test('getTypeStruct - boolean type', () => {
    const result = getTypeStruct(true, 'testField');
    expect(result.type).toBe(TypeGroup.Boolean);
  });

  test('getTypeStruct - array type', () => {
    const target = [1, 'two', true];
    const result = getTypeStruct(target, 'testField');
    expect(result.type).toBe(TypeGroup.Array);
    expect(result.target?.length).toBe(target.length);
  });
  test('getTypeStruct - object type', () => {
    const target = { name: 'John', age: 30 };
    const result = getTypeStruct(target, 'testField');
    expect(result.type).toBe(TypeGroup.Object);
    expect(result.target?.length).toBe(Object.keys(target).length);
  });

  test('getTypeStruct - nested array type', () => {
    const target = [[1, 2], [3, 4]];
    const result = getTypeStruct(target, 'testField');
    expect(result.type).toBe(TypeGroup.Array);
    console.log(result.target)
    expect(result.target?.length).toBe(target.length);
  });

  test('getTypeStruct - empty array', () => {
    const target: unknown[] = [];
    const result = getTypeStruct(target, 'testField');
    expect(result.type).toBe(TypeGroup.Array);
    expect(result.target?.length).toBe(0);
  });

  test('getTypeStruct - empty object', () => {
    const target: Record<string, unknown> = {};
    const result = getTypeStruct(target, 'testField');
    expect(result.type).toBe(TypeGroup.Object);
    expect(result.target?.length).toBe(0);
  });
})

describe('parse type struct', () => {
  test('parseTypeStruct - string type', () => {
    const typeStruct: ITypeStruct = {
      field: 'testField',
      type: TypeGroup.String,
      declares: 'type',
    };
    const result = parseTypeStruct(typeStruct, true);
    expect(result).toBe('type testField = string');
  });


  test('parseTypeStruct - number type', () => {
    const typeStruct: ITypeStruct = {
      field: 'testField',
      type: TypeGroup.Number,
      declares: 'type',
    };
    const result = parseTypeStruct(typeStruct, true);
    expect(result).toBe('type testField = number');
  });


  test('parseTypeStruct - boolean type', () => {
    const typeStruct: ITypeStruct = {
      field: 'testField',
      type: TypeGroup.Boolean,
      declares: 'type',
    };
    const result = parseTypeStruct(typeStruct, true);
    expect(result).toBe('type testField = boolean');
  });

  test('parseTypeStruct - undefined type', () => {
    const typeStruct: ITypeStruct = {
      field: 'testField',
      type: TypeGroup.Undefined,
      declares: 'type',
    };
    const result = parseTypeStruct(typeStruct, true);
    expect(result).toBe('type testField = undefined');
  });
  test('parseTypeStruct - array type', () => {
    const typeStruct: ITypeStruct = {
      field: 'testField',
      type: TypeGroup.Array,
      declares: 'type',
      target: [
        { field: 'itemField', type: TypeGroup.String, declares: 'type' },
        { field: 'itemField', type: TypeGroup.Number, declares: 'type' },
        { field: 'itemField', type: TypeGroup.Boolean, declares: 'type' },
      ],
    };
    const result = parseTypeStruct(typeStruct, true);
    expect(result).toBe('type testField = Array<string | number | boolean>');
  });

  test('parseTypeStruct - object type', () => {
    const typeStruct: ITypeStruct = {
      field: 'testField',
      type: TypeGroup.Object,
      declares: 'interface',
      target: [
        { field: 'key', type: TypeGroup.String, declares: 'type' },
        { field: 'target', type: TypeGroup.Boolean, declares: 'type' },
      ],
    };
    const result = parseTypeStruct(typeStruct, true);
    expect(result).toBe('interface testField = {\n\tkey: string\n\ttarget: boolean\n}');
  });

})