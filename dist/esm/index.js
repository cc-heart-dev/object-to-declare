import { isStr, isUndef, isNumber, isBool, isObject } from '@cc-heart/utils';

function parseValueMapTypeGroup(target) {
    if (isStr(target))
        return 0 /* TypeGroup.String */;
    if (isUndef(target))
        return 4 /* TypeGroup.Undefined */;
    if (isNumber(target))
        return 1 /* TypeGroup.Number */;
    if (isBool(target))
        return 2 /* TypeGroup.Boolean */;
    if (Array.isArray(target))
        return 5 /* TypeGroup.Array */;
    if (isObject(target))
        return 6 /* TypeGroup.Object */;
    return 3 /* TypeGroup.Null */;
}
function generatorTypeStructTree(target, field, parentTreeMap) {
    let typeStructTree = parentTreeMap?.get(field) ?? {
        type: [],
    };
    switch (parseValueMapTypeGroup(target)) {
        case 0 /* TypeGroup.String */:
            typeStructTree.type = [...(typeStructTree.type ?? []), 0 /* TypeGroup.String */];
            break;
        case 1 /* TypeGroup.Number */:
            typeStructTree.type = [...(typeStructTree.type ?? []), 1 /* TypeGroup.Number */];
            break;
        case 2 /* TypeGroup.Boolean */:
            typeStructTree.type = [...(typeStructTree.type ?? []), 2 /* TypeGroup.Boolean */];
            break;
        case 3 /* TypeGroup.Null */:
            typeStructTree.type = [...(typeStructTree.type ?? []), 3 /* TypeGroup.Null */];
            break;
        case 4 /* TypeGroup.Undefined */:
            typeStructTree.type = [...(typeStructTree.type ?? []), 4 /* TypeGroup.Undefined */];
            break;
        case 5 /* TypeGroup.Array */:
            if (!typeStructTree.children) {
                typeStructTree.children = new Map();
            }
            typeStructTree.type = [...(typeStructTree.type ?? []), 5 /* TypeGroup.Array */];
            const arrayField = `${field}_$$children`;
            target.forEach(item => {
                const children = generatorTypeStructTree(item, arrayField, typeStructTree.children);
                const prevValue = typeStructTree.children.get(arrayField);
                if (!prevValue) {
                    typeStructTree.children.set(arrayField, children);
                }
                else {
                    prevValue.type = [...new Set([...children.type, ...prevValue.type])];
                }
            });
            break;
        case 6 /* TypeGroup.Object */:
            if (parentTreeMap && !parentTreeMap.get(field)) {
                parentTreeMap.set(field, typeStructTree);
            }
            if (!typeStructTree.children) {
                typeStructTree.children = new Map();
            }
            typeStructTree.type = [...(typeStructTree.type ?? []), 6 /* TypeGroup.Object */];
            Object.keys(target).forEach(key => {
                let typeStructTreeChildren = generatorTypeStructTree(target[key], key, typeStructTree.children);
                const prevValue = typeStructTree.children.get(key);
                if (!prevValue) {
                    typeStructTree.children.set(key, typeStructTreeChildren);
                }
                else {
                    prevValue.type = [...new Set([...typeStructTreeChildren.type, ...prevValue.type])];
                }
            });
            break;
    }
    return typeStructTree;
}
function parseTypeStructTreeToTsType(typeStructTree) {
    const valueList = typeStructTree.type.map(target => {
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
                for (const [key, value] of typeStructTree.children) {
                    val += `\n\t${key}: ${parseTypeStructTreeToTsType(value)}`;
                }
                val += '\n}';
                return val;
            case 5 /* TypeGroup.Array */:
                let arrayVal = [];
                for (const [, value] of typeStructTree.children) {
                    arrayVal.push(parseTypeStructTreeToTsType(value));
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
    const declareType = isObject(target) ? 'interface' : 'type';
    return `${declareType} ${options.rootName} ${declareType === 'interface' ? '' : '='} ` + parseTypeStructTreeToTsType(typeStructTree);
}

export { generateTypeDeclaration as default };
