'use strict';

var utils = require('@cc-heart/utils');

function isArrayObject(target) {
    return Array.isArray(target) && target.reduce((acc, cur) => acc && utils.isObject(cur), true);
}
function getHashByObject(obj) {
    const hash = JSON.stringify(obj);
    return hash;
}
function isJSON(target) {
    try {
        const hash = JSON.parse(target);
        return hash !== null && !Array.isArray(hash);
    }
    catch {
        return false;
    }
}
function isValidPropertyName(name) {
    // 是否是合法的属性名字
    return /^[a-zA-Z0-9]*$/.test(name);
}
function isValidInterfaceName(name) {
    return /^[a-zA-z0-9_]*$/.test(name);
}
function parseInterface(name) {
    return name
        .split('_')
        .map((_) => utils.capitalize(_))
        .map((_) => (!isValidInterfaceName(_) ? '__Valid' : _))
        .join('_');
}

function optimizeTypeStructure(target, hash, map, cacheTypesName = new Set()) {
    let str = '';
    const data = target.find((item) => item.hash === hash);
    let name = data.name;
    if (data) {
        if (cacheTypesName.has(name)) {
            return str;
        }
        cacheTypesName.add(name);
        str += `interface ${name} {\n`;
        Object.entries(data.target).forEach(([key, value]) => {
            if (value !== null && isJSON(value)) {
                key = utils.underlineToHump(key);
                const subInterface = optimizeTypeStructure(target, value, map, cacheTypesName);
                map.unshift(subInterface);
                const subInterfaceTarget = target.find((_) => _.hash === value);
                if (subInterfaceTarget) {
                    let { name } = subInterfaceTarget;
                    name = parseInterface(name);
                    let typeVal;
                    switch (subInterfaceTarget.type) {
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

var TypeGroup;
(function (TypeGroup) {
    TypeGroup[TypeGroup["Primitive"] = 0] = "Primitive";
    TypeGroup[TypeGroup["Array"] = 1] = "Array";
    TypeGroup[TypeGroup["Object"] = 2] = "Object";
})(TypeGroup || (TypeGroup = {}));

function getTypeGroup(target) {
    if (Array.isArray(target))
        return TypeGroup.Array;
    if (utils.isObject(target))
        return TypeGroup.Object;
    return TypeGroup.Primitive;
}
function getTypeStruct(targetObj, typeStructList = [], name = '', type = TypeGroup.Object, isRootName = false) {
    switch (getTypeGroup(targetObj)) {
        case TypeGroup.Array:
            const typeArrayStructList = targetObj
                .map((val) => {
                return getTypeStruct(val, typeStructList, name, TypeGroup.Array);
            })
                .filter((val, index, self) => self.indexOf(val) === index);
            switch (typeArrayStructList.length) {
                case 0:
                    return `[]`;
                case 1:
                    return `${typeArrayStructList[0]}[]`;
                default:
                    return `(${typeArrayStructList.join(' | ')})[]`;
            }
        case TypeGroup.Object:
            const target = getTypeOfObject(targetObj, typeStructList);
            const hash = getHashByObject(target);
            const inter = typeStructList.find((val) => val.hash === hash);
            if (!isRootName)
                name = parseInterface(name);
            if (inter) {
                if (type !== TypeGroup.Array) {
                    inter.name = `${inter.name}_${name}`;
                }
            }
            else {
                typeStructList.push({
                    hash,
                    name,
                    target,
                    type,
                });
            }
            return hash;
        case TypeGroup.Primitive:
            return getTypeOfPrimitive(targetObj);
    }
}
function getTypeOfObject(targetObj, typeStructList) {
    return Object.entries(targetObj).reduce((acc, [key, value]) => {
        // object array primitive
        if (!isValidPropertyName(key)) {
            key = `'${key}'`;
        }
        else {
            key = key;
        }
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
    getTypeStruct(target, typeStructList, newOption.rootName, TypeGroup.Object, true);
    return output(typeStructList, newOption.rootName, Array.isArray(target));
}

module.exports = generateTypeDeclaration;
