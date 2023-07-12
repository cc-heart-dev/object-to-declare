'use strict';

var utils = require('@cc-heart/utils');

function covertToInterface(target) {
    return target.replaceAll(/"|,/g, '');
}

var TypeGroup;
(function (TypeGroup) {
    TypeGroup[TypeGroup["Primitive"] = 0] = "Primitive";
    TypeGroup[TypeGroup["Array"] = 1] = "Array";
    TypeGroup[TypeGroup["Object"] = 2] = "Object";
})(TypeGroup || (TypeGroup = {}));

function isArrayObject(target) {
    return Array.isArray(target) && target.reduce((acc, cur) => acc && utils.isObject(cur), true);
}
function getHashByObject(obj) {
    const hash = JSON.stringify(obj);
    return hash;
}
function isHash(target) {
    try {
        const hash = JSON.parse(target);
        return hash !== null && !Array.isArray(hash);
    }
    catch {
        return false;
    }
}

function optimizeTypeStructure(target, hash, map) {
    let str = '';
    const data = target.find((item) => item.hash === hash);
    if (data) {
        str += `interface ${data.name} {\n`;
        Object.entries(data.target).forEach(([key, value]) => {
            if (value !== null && isHash(value)) {
                key = utils.underlineToHump(key);
                const subInterface = optimizeTypeStructure(target, value, map);
                map.unshift(subInterface);
                const subInterfaceTarget = target.find((_) => _.hash === value);
                if (subInterfaceTarget) {
                    const { name } = subInterfaceTarget;
                    let typeVal;
                    switch (subInterfaceTarget.type) {
                        case TypeGroup.Array:
                            typeVal = `${name}[]`;
                            break;
                        default:
                            typeVal = name;
                    }
                    str += `  ${key}: ${typeVal}\n`;
                }
            }
            else {
                str += `  ${key}: ${value}\n`;
            }
        });
        str += '}';
    }
    return str;
}
function output(target, rootName, rootIsArray) {
    const { hash } = target.find((val) => val.name === rootName);
    const list = [];
    const rootInterface = optimizeTypeStructure(target, hash, list);
    list.unshift(rootInterface);
    if (rootIsArray) {
        list.unshift(`type ${rootName}Type = ${rootName}[]\n`);
    }
    return list.reduce((acc, cur) => {
        return acc + (acc ? '\n' : '') + cur;
    }, '');
}

function getTypeGroup(target) {
    if (Array.isArray(target))
        return TypeGroup.Array;
    if (utils.isObject(target))
        return TypeGroup.Object;
    return TypeGroup.Primitive;
}
function getTypeStruct(targetObj, typeStructList = [], name = '', type = TypeGroup.Object) {
    switch (getTypeGroup(targetObj)) {
        case TypeGroup.Array:
            const typeArrayStructList = targetObj
                .map((val) => {
                return getTypeStruct(val, typeStructList, name, TypeGroup.Array);
            })
                .filter((val, index, self) => self.indexOf(val) === index);
            switch (typeArrayStructList.length) {
                case 0:
                    return [];
                case 1:
                    return typeArrayStructList.join(' | ');
                default:
                    return `(${typeArrayStructList.join(' | ')})[]`;
            }
        case TypeGroup.Object:
            const target = getTypeOfObject(targetObj, typeStructList);
            const hash = getHashByObject(target);
            typeStructList.push({
                hash,
                name,
                target,
                type,
            });
            return hash;
        case TypeGroup.Primitive:
            return getTypeOfPrimitive(targetObj);
    }
}
function getTypeOfObject(targetObj, typeStructList) {
    return Object.entries(targetObj).reduce((acc, [key, value]) => {
        // object array primitive
        acc[key] = getTypeStruct(value, typeStructList, key, TypeGroup.Object);
        return acc;
    }, {});
}
function getTypeOfPrimitive(target) {
    if (utils.isNull(target))
        return null;
    return typeof target;
}

function generateTypeDeclaration(target, options = {}) {
    const defaultOptions = {
        rootName: 'IRootName',
    };
    if (!utils.isObject(target) && !isArrayObject(target)) {
        throw new Error('target must be object or objectArray');
    }
    const newOption = { ...defaultOptions, ...options };
    const typeStructList = [];
    getTypeStruct(target, typeStructList, newOption.rootName);
    return covertToInterface(output(typeStructList, newOption.rootName, Array.isArray(target)));
}

module.exports = generateTypeDeclaration;
