'use strict';

var utils = require('@cc-heart/utils');

function parseValueMapTypeGroup(target) {
    const typeMap = {
        string: 0 /* TypeGroup.String */,
        undefined: 4 /* TypeGroup.Undefined */,
        number: 1 /* TypeGroup.Number */,
        boolean: 2 /* TypeGroup.Boolean */,
        object: 6 /* TypeGroup.Object */,
    };
    const targetType = typeof target;
    if (Array.isArray(target))
        return 5 /* TypeGroup.Array */;
    if (utils.isNull(target))
        return 3 /* TypeGroup.Null */;
    return typeMap[targetType];
}
function mergeTreeType(currentType, typeStructTree) {
    return [...typeStructTree.type, currentType];
}
// 递归 children 生成类型
function recursiveChildrenGenerateType(target, field, typeStructTree) {
    const children = generatorTypeStructTree(target, field, typeStructTree.children);
    const existChildrenTarget = typeStructTree.children.get(field);
    if (!existChildrenTarget) {
        typeStructTree.children.set(field, children);
    }
    else {
        existChildrenTarget.type = [...new Set([...children.type, ...existChildrenTarget.type])];
    }
}
function generatorTypeStructTree(target, field, parentTreeMap) {
    let typeStructTree = parentTreeMap?.get(field) ?? {
        type: [],
    };
    switch (parseValueMapTypeGroup(target)) {
        case 0 /* TypeGroup.String */:
            typeStructTree.type = mergeTreeType(0 /* TypeGroup.String */, typeStructTree);
            break;
        case 1 /* TypeGroup.Number */:
            typeStructTree.type = mergeTreeType(1 /* TypeGroup.Number */, typeStructTree);
            break;
        case 2 /* TypeGroup.Boolean */:
            typeStructTree.type = mergeTreeType(2 /* TypeGroup.Boolean */, typeStructTree);
            break;
        case 4 /* TypeGroup.Undefined */:
            typeStructTree.type = mergeTreeType(4 /* TypeGroup.Undefined */, typeStructTree);
            break;
        case 5 /* TypeGroup.Array */:
            if (!typeStructTree.children) {
                typeStructTree.children = new Map();
            }
            typeStructTree.type = mergeTreeType(5 /* TypeGroup.Array */, typeStructTree);
            const arrayChildrenField = `${String(field)}__$$children`;
            target.forEach((item) => {
                recursiveChildrenGenerateType(item, arrayChildrenField, typeStructTree);
            });
            break;
        case 6 /* TypeGroup.Object */:
            if (parentTreeMap && !parentTreeMap.get(field)) {
                parentTreeMap.set(field, typeStructTree);
            }
            if (!typeStructTree.children) {
                typeStructTree.children = new Map();
            }
            typeStructTree.type = mergeTreeType(6 /* TypeGroup.Object */, typeStructTree);
            Object.keys(target).forEach((key) => {
                recursiveChildrenGenerateType(target[key], key, typeStructTree);
            });
            break;
        default:
            typeStructTree.type = mergeTreeType(3 /* TypeGroup.Null */, typeStructTree);
    }
    return typeStructTree;
}
function generateSpace(space) {
    let ret = '';
    for (let i = 0; i < space; i++) {
        ret += '\t';
    }
    return ret;
}
function parserKey(key) {
    const validIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
    if (validIdentifier.test(key))
        return key;
    return `'${key}'`;
}
function parseTypeStructTreeToTsType(typeStructTree, space = 1) {
    const valueList = typeStructTree.type.map((target) => {
        switch (target) {
            case 2 /* TypeGroup.Boolean */:
                return 'boolean';
            case 1 /* TypeGroup.Number */:
                return 'number';
            case 0 /* TypeGroup.String */:
                return 'string';
            case 4 /* TypeGroup.Undefined */:
                return 'undefined';
            case 6 /* TypeGroup.Object */:
                let val = '{';
                const childrenObjectSpace = space + 1;
                for (const [key, value] of typeStructTree.children) {
                    val += `\n${generateSpace(space)}${parserKey(String(key))}: ${parseTypeStructTreeToTsType(value, childrenObjectSpace)}`;
                }
                val += `\n${generateSpace(space - 1)}}`;
                return val;
            case 5 /* TypeGroup.Array */:
                let arrayVal = [];
                const childrenArraySpace = space + 1;
                for (const [, value] of typeStructTree.children) {
                    const childrenSpace = typeof value === 'object' && value !== null ? space : childrenArraySpace;
                    arrayVal.push(parseTypeStructTreeToTsType(value, childrenSpace));
                }
                return `Array<${arrayVal.join(' | ')}>`;
        }
        return 'null';
    });
    return [...new Set(valueList)].join(' | ');
}

function generateTypeDeclaration(target, options = {}) {
    const defaultOptions = {
        rootName: 'IRootName',
    };
    options = { ...defaultOptions, ...options };
    const typeStructTree = generatorTypeStructTree(target, options.rootName);
    const declareType = utils.isObject(target) ? 'interface' : 'type';
    return `${declareType} ${options.rootName} ${declareType === 'interface' ? '' : '='} ` + parseTypeStructTreeToTsType(typeStructTree);
}

module.exports = generateTypeDeclaration;
