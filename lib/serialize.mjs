/**
 * utilities for serializing/deserializing values and objects
 *
 * todo:
 *  - [REFACTOR]: currently this is very ECMA Script specific. Evolve to semantic types/classes which can be converted from/to (all) other languages
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import {
    isNil,
    isDate,
    isBoolean,
    isNumber,
    isString,
    isSymbol,
    isObject,
    isFunction,
    isError,
    isRef
}                           from "/evolux.util/lib/objutils.mjs";
import AccessObserver, {
    getAllMethodNames,
    getAllMethodNamesCategorized
}                           from "/evolux.universe/lib/accessobserver.mjs";
import { isClass }          from "/evolux.util/lib/utilfns.mjs";
import ThoregonDecorator    from "/thoregon.archetim/lib/thoregondecorator.mjs";
import RemoteCollection     from "/thoregon.archetim/lib/remotecollection.mjs";
import RemoteDirectory      from "/thoregon.archetim/lib/remotedirectory.mjs";
import RemoteFileDescriptor from "/thoregon.truCloud/lib/unifiedfile/remotefiledescriptor.mjs";

let EntityDecorator = ThoregonDecorator;

export const useEntityDecorator = (decorator) => EntityDecorator = decorator;

// serialization prefix
const S = 's͛';

export const isPrivateProperty = (property) => isSymbol(property) ? true : !isString(property) ? false :  property.startsWith('_') || property.startsWith('$') || property.endsWith('_') || property.endsWith('$');

const EXCLUDED_PROPERTIES = new Set(['metaClass', 'metaclass', 'materialize', 'create', /*'delete',*/ 'getCrypto']);
const excludeProperties = (property) => EXCLUDED_PROPERTIES.has(property);
//
// additional simple values and types to be serialized
//
export const isStream     = (obj) => false;       // todo
export const isFile       = (obj) => false;       // todo
export const isTypedArray = (obj) => obj instanceof Int8Array || obj instanceof Uint8Array || obj instanceof Uint8ClampedArray || obj instanceof Int16Array || obj instanceof Uint16Array || obj instanceof Int32Array || obj instanceof Uint32Array || obj instanceof Float32Array || obj instanceof Float64Array || obj instanceof BigInt64Array || obj instanceof BigUint64Array;
export const isSet        = (obj) => obj instanceof Set;
export const isMap        = (obj) => obj instanceof Map;
export const isRegExp     = (obj) => obj instanceof RegExp;
export const isInfinity   = (obj) => obj === Infinity;
export const isArray      = (obj) => Array.isArray(obj);
// export const isDocNode    = (obj) => obj instanceof Element;

//
// Collections & Iterables
//
export const isSyncIterable  = (obj) => obj != null && typeof obj[Symbol.iterator] === 'function';  // caution: streams and files are NOT iterables! always distinguish between streams and iterables
export const isAsyncIterable = (obj) => obj != null && typeof obj[Symbol.asyncIterator] === 'function';
export const isIterable      = (obj) => obj != null && (isSyncIterable(obj) || isAsyncIterable(obj));

//
// Thoregon Entities
//

export const isThoregon = (obj) => obj && !!obj.$thoregon;     // a persistent, decorated thoregon entity

//
// Reflection & Classes
//
/*
export const isClass = (obj) => {
    const isCtorClass = obj.constructor
                        && obj.constructor.toString().substring(0, 5) === 'class'
    if(obj.prototype === undefined) {
        return isCtorClass
    }
    const isPrototypeCtorClass = obj.prototype.constructor
                                 && obj.prototype.constructor.toString
                                 && obj.prototype.constructor.toString().substring(0, 5) === 'class'
    return isCtorClass || isPrototypeCtorClass
}

function isClass2(funcOrClass) {
    const propertyNames = Object.getOwnPropertyNames(funcOrClass);
    return (!propertyNames.includes('prototype') || propertyNames.includes('arguments'));
}
*/

//
// string utuls
//

/**
 * split a string containing json objects by a delimiter. additional split rules:
 *  - consider embedded strings.
 *  - consider also escaped string characters
 *  - consider brackets (), {} and []
 *
 * @note: generated by ChatGPT, 2023-03-31
 *   to improve:
 *      - create a Set for quote chars and bracket chars
 *
 * @param str
 * @param delimiter
 * @returns {*[]}
 */

export function codesplit(str, delimiter) {
    const items      = [];
    let start        = 0;
    let insideQuote  = false;
    let bracketStack = [];

    for (let i = 0; i < str.length; i++) {
        const char = str[i];

        if (char === delimiter[0] && !insideQuote && bracketStack.length === 0 && str.substring(i, i + delimiter.length) === delimiter) {
            const item = str.substring(start, i);
            if (item.trim() !== '') {
                items.push(item.trim());
            }
            start = i + delimiter.length;
            i     = start - 1;
        } else if (char === "'" || char === '"') {
            if (!insideQuote) {
                insideQuote = char;
            } else if (insideQuote === char && str[i - 1] !== '\\') {
                insideQuote = false;
            }
        } else if (char === '[' || char === '{' || char === '(') {
            if (!insideQuote) {
                bracketStack.push(char);
            }
        } else if (char === ']' || char === '}' || char === ')') {
            if (!insideQuote && bracketStack.length > 0 && ((char === ']' && bracketStack[bracketStack.length - 1] === '[') ||
                                                            (char === '}' && bracketStack[bracketStack.length - 1] === '{') ||
                                                            (char === ')' && bracketStack[bracketStack.length - 1] === '('))) {
                bracketStack.pop();
            }
        }
    }

    const lastItem = str.substring(start).trim();
    if (lastItem !== '') {
        items.push(lastItem);
    }

    return items;
}


//
// serialize/deserialize
//

const sinifinity = S + '∞';

export const simpleSerialize = (obj) => isSymbol(obj) || isString(obj) || isNumber(obj) || isBoolean(obj) || isDate(obj) || isTypedArray(obj) || isStream(obj) || isError(obj) || isRegExp(obj) /*|| isDocNode(obj)*/;  // todo [REFACTOR]: make is available also for headless (nodeJS) environments
export const canReference    = (obj) => !isFunction(obj) && !(obj instanceof WeakSet) && !(obj instanceof WeakRef) && !(obj instanceof DataView);    // reject also WebAssembly, SharedArrayBuffer, Generator, GeneratorFunction; also Proxies but this cannot be checked

export const isSerialized = (str) => str.startsWith(S);


export const asOrigin = (Cls) => {
    let origin = dorifer.origin4cls(Cls);
    origin = origin ? origin.repo : 'builtin:Object';
    return origin;
}

export const classOrigin = (obj) => {
    let origin = dorifer.origin4cls(obj.constructor);
    origin = origin ? origin.repo : Array.isArray(obj) ? 'builtin:Array' : 'builtin:Object';
    return origin;
}

export const originAsClass = async (origin) => {
    let Cls = dorifer.cls4origin(origin);
    if (!Cls) Cls = await dorifer.fetchCls4origin(origin);
    let spec = Cls ? { Cls, repo: true } : { Cls: origin === 'builtin:Array' ? Array : Object, repo: false };
    return spec;
}

export const origin2Class = (origin) => {
    let Cls = dorifer.cls4origin(origin);
    let spec = Cls ? { Cls, repo: true } : { Cls: origin === 'builtin:Array' ? Array : Object, repo: false, origin };
    return spec;
}

export const loadOriginClass = async (origin) => {
    let Cls = dorifer.cls4origin(origin);
    if (!Cls) {

    }
    let spec = Cls ? { Cls, repo: true } : { Cls: Object, repo: false };
    return spec;
}

// by default arrays and array like types stores each element as reference.
// can be overruled by defining the property in the metaclass as serialize: 'flat'.
// serializes also arrays and array like types on demand.

export const serialize = (obj) => {
    if (isString(obj)) {
        if (obj.startsWith('{')) obj = '\\' + obj;
        return obj.replace(/"/g, '\\\"').replace(/'/g, '\\\'');
    } else if (isNil(obj) || isNumber(obj) || isBoolean(obj)) {
        return obj;
    } else if (isDate(obj)) {
        return S + 'D|' + obj.toISOString();
    } else if (isSymbol(obj)) {
        const gs = Symbol.keyFor(obj);
        return gs ? S + 'GS|' + gs : S + 'S|' + obj.toString().substring(7).slice(0,-1);
    } else if (isRegExp(obj)) {
        const rx = obj.toString();
        return S + 'R|' + rx.substring(1, rx.length-1) + '|' + obj.flags;
    } else if (isInfinity(obj)) {
        return sinifinity;
    } else if (isArray(obj)) {
        return S + 'A|Array|' + obj.map(item => JSON.stringify(item));
    } else if (isSet(obj)) {
        return S + 'A|Set|' + [...obj.values()].map(item => JSON.stringify(item));
    } else if (isMap(obj)) {
        return S + 'O|Map|' + [...obj.entries()].map(entry => "[" + JSON.stringify(entry[0]) + "="+ JSON.stringify(entry[1]) + "]").toString();
    } else if (isTypedArray(obj)) {
        return S + 'A|' + obj.constructor.name + '|' + obj.toString();
    } else if (isError(obj)) {
        return S +'E|' + obj.constructor.name + '|' + obj.message /*+ (obj.stack ? ':' + obj.stack : '')*/;
        // todo [REFACTOR]: make is available also for headless (nodeJS) environments
        // } else if (isDocNode(obj)) {
        //     return S + 'N|' + obj.outerHTML;
    } else if (isClass(obj)) {
        return S + 'C|' + obj.constructor.name;     // todo [OPEN]: get URL from registry (checkIn)
    } else if (isObject(obj)) {
        // reference the right class see -> classOrigin()
        return S + 'O|' + obj.constructor.name + '|' + [...Object.entries(obj)].map(entry => "[" + JSON.stringify(entry[0]) + "="+ JSON.stringify(entry[1]) + "]").toString(); // todo [OPEN]: get URL from registry (checkIn)
    }
    return undefined;       // can't serialize simple object flat
}

// todo [REFACTOR]: replace all 'split' with correct parsing. the values my also contain the separator
export const deserialize = (str) => {
    // parse only strings, if it is another object just return it
    if (!isString(str)) return str;

    const parts = str.split('|');
    if (parts.length === 0) return;     // empty strings as undefined
    if (!parts[0].startsWith(S)) {
        let val = parts[0].trim();
        if (val === 'null') return null;
        if (val === 'undefined') return undefined;
        if (val.startsWith('\\{')) val = val.substring(1);
        try { return JSON.parse(val); } catch (ignore) { }  // log somehow for debugging
        return isString(val) ? val.replace(/\\"/g, '"').replace(/\\'/g, "'") : val;
    }
    const selector = parts[0].substring(2);    // caution: because the 's͛' is a combined char it is 2 chars long
    if (parts.length < 2) {
        if (selector === sinifinity) return Infinity;
        try { return JSON.parse(str); } catch (ignore) { }  // log somehow for debugging
        return;     // undefined if error
    }

    if (selector === 'D') {
        return new Date(Date.parse(parts.slice(1).join(':')));
    } else if (selector === 'S') {
        return Symbol(parts[1]);
    } else if (selector === 'GS') {
        return Symbol.for(parts[1]);
    } else if (selector === 'R') {  //RegEx
        const rx = parts[1];
        const flags =  parts[2];
        return new RegExp(rx, flags);
    } else if (selector === 'A') {
        const type = parts[1];
        const items = parts[2].split(',').map(item => JSON.parse(item));
        if (type ==='Array') {
            return items;
        } else if (type === 'Set') {
            return new Set(items);
        } else {
            const AryCls = globalThis[parts[1]];
            return AryCls ? AryCls.from(items) : undefined;
        }
    } else if (selector === 'O') {
        const type = parts[1];
        const entries = parts[2].split(',');
        const obj = (type === 'Map') ? new Map() : {};  // instantiate class -> see classOrigin()
        entries.forEach(entry => {
            try {
                const eparts = entry.substring(1).slice(0, -1).split("=");  // todo [TODO]: better parsing if '=' is enclosed in a string
                const key    = JSON.parse(eparts[0]);
                const value  = JSON.parse(eparts[1]);
                if (type === 'Map') obj.set(key, value); else obj[key] = value;
            } catch (e) {
                // console.log("deserialize: can't parse Map entry:", entry, e);
            }
        })
        return obj;
    } else if (selector === 'E') {
        const ErrCls = globalThis[parts[1]];
        if (ErrCls) return new ErrCls(parts[2]);
        // todo [REFACTOR]: make is available also for headless (nodeJS) environments
        // } else if (selector === 'N') {
        //     const elem = document.createElement('div');
        //     elem.innerHTML = parts[1];
        //     return elem.firstChild;
    } else if (selector === 'C') {
        // todo
    }

    // const Cls = globalThis[parts[1]];
}

//
// crystalize: take care of thoregon entries, serialize reference to 'soul'
// todo [OPEN]: introduce an AST parser for error free parsing of delimiters
//

export function crystallize(obj, opt) {
    return (isRef(obj))
           ? txserialize(obj, opt)
           : serialize(obj, opt);
}

export function decrystallize(str, opt) {
    if (!isString(str)) return str;
    str = str.trim();
    if (str.startsWith('{')) {
        // const tx = EntityDecorator.startSyncTX();
        const { obj, refs } = txdeserialize(str, opt);
        tx.prepare();
        tx.commit();
        return obj;
    } else {
        return deserialize(str);
    }
}

/**
 * serialization of first level only references of thoregon entities
 * crystallizes:
 *  - single thoregon entries
 *  - Objects with thoregon entries as properties
 *  - Arrays with thoregon entries as items
 *  - serializes all other
 * @param obj
 * @return {Promise<string|any>}
 */
export async function crystallize_(obj) {
    if (isThoregon(obj)) {
        return S + 'T|' + await obj.soul + '|' + obj.classOrigin();
    } else if (isArray(obj)) {
        let cryst = S + 'TA|';
        let sep = '';
        for await (const item of obj) {
            cryst += sep + '[';
            if (isThoregon(item)) {
                cryst += 't>' + await item.soul;
            } else {
                cryst += 'v>' + JSON.stringify(item);
            }
            cryst += ']';
            sep = ',';
        }
        return cryst;
    } else if (isObject(obj)) {
       let cryst = S + 'TO|';
       let sep = '';
       for await (const [attr, value] of Object.entries(obj)) {
           cryst += sep + '[' + attr + '=';
           if (isThoregon(value)) {
               cryst += 't>' + await value.soul+ '#' + value.classOrigin();
           } else {
               cryst += 'v>' + JSON.stringify(value);
           }
           cryst += ']';
           sep = ',';
       }
       return cryst;
    } else {
        return serialize(obj);
    }
}

export /*async*/ function decrystallize_(str) {
    if (!isString(str)) return str;

    const parts = str.split('|');
    if (parts.length === 0) return;     // empty strings as undefined
    if (!parts[0].startsWith(S)) return parts[0];
    const selector = parts[0].substring(2);    // caution: because the 's͛' is a combined char it is 2 chars long

    if (selector === 'T') {     // Thoregon Entity
        // todo CRYSTALLINE-1: extract the 'survivalKit' and initialize the entity
        const soul = parts[1];
        const { Cls, repo }  = origin2Class(parts[2]);
        const obj = universe.ThoregonObject.from(soul, { Cls }); //  await universe.ThoregonObject.available(soul, { Cls });
        return obj;
    } if (selector === 'TO') {  // Object eventually with thoregon entities as properties
        const attrs = codesplit(parts[1], ',');
        const obj = {};
        for /*await*/ (let attr of attrs) {
            let i = attr.indexOf('[');
            if (i > -1) attr = attr.substring(i+1);
            const [name, value] = attr.split('=');
            let deserialized;
            if (!value) {
                deserialized = undefined;
            } else if (value.startsWith('t>')) {
                // todo CRYSTALLINE-1: extract the 'survivalKit' and initialize the entity
                const tparts = value.substring(2).split('#');
                const { Cls, repo }  = origin2Class(tparts[1].slice(0,-1));
                const soul = tparts[0];
                deserialized = universe.ThoregonObject.from(soul, { Cls }); //  await universe.ThoregonObject.available(soul, { Cls });
            } else {
                const str = value.slice(2,-1);
                deserialized = (str === 'undefined') ? undefined : JSON.parse(str);
            }
            Reflect.set(obj, name, deserialized);
        }
        return obj;
    } if (selector === 'TA') {  // Array eventually with thoregon entities as items
        const items = parts[1].split(',').map(part => part.substring(1).slice(0,-1));
        const ary = [];
        for /*await*/ (const item of items) {
            let deserialized;
            if (item.startsWith('t>')) {
                deserialized = universe.ThoregonObject.from(item.substring(2));
            } else {
                deserialized = JSON.parse(item.substring(2));
            }
            ary.push(deserialized);
        }
        return ary;
    } else {
        return deserialize(str);
    }
}

// test

// todo [OPEN]: utilize json-ld and/or json-schema

export const txserialize = (obj, opt = {}) => {
    if (!isObject(obj)) return obj;
    if (!opt.excl) opt.excl = new Map();
    let id   = opt.excl.get(obj);
    if (id) return `'@ref:${id}'`;
    let type = classOrigin(obj);
    id       = obj.soul ?? universe.random(5);
    opt.excl.set(obj, id);
    let str = `{ '@id': '${id}', '@type': '${type}'`;
    if (obj.soul) str = `${str}, '@soul': '${obj.soul}'`;

    let props = Reflect.ownKeys(obj);
    if (Array.isArray(obj)) props = props.filter(i => i !== 'length');

    // todo: loop over embedded when it is a ThoregonEntity
    props.forEach((name) => {
        if (isPrivateProperty(name)) return;
        if (obj.metaClass) {
            const prop = obj.metaClass.getAttribute(name);
            if (prop && (!prop.merge || prop.emergent || prop.derived )) return;
        }
        if (opt.filter && !opt.filter(name, obj)) return;
        const item = Reflect.get(obj, name);
        if (isRef(item) && !(isDate(item))) {
            // recursive
            str = `${str}, '${name}': ${txserialize(item, opt)}`;
        } else {
            // simple type
            str = `${str}, '${name}': '${serialize(item)}'`;
        }
    });

    return `${str} }`;
}

export const txdeserialize = (str, opt = {}) => {
    if (!isString(str)) return str;
    const tx = opt.tx;
    if (!opt.refs) opt.refs = {};
    if (str.startsWith("'@ref:")) {
        const id = "'" + str.substring(6);
        return opt.refs[id];
    }
    const props = {};
    const parts = codesplit(str.substring(1).slice(0,-1).trim(),',');
    parts.forEach((part) => {
        part = part.trim();
        const [name, value] = codesplit(part, ':');
        const prop = name.trim().substring(1).slice(0,-1);
        const propval = value?.trim();
        if (propval != undefined) props[prop] = propval.startsWith('{') ? propval : propval.substring(1).slice(0,-1);
    })

    const id = props['@id'];
    const soul = props['@soul'];
    let ref  = opt.refs[id];
    if (ref) return ref;

    const typeRef    = props['@type'] ?? 'builtin:Object';
    const { Cls } = origin2Class(typeRef);

    const obj = soul
                ? EntityDecorator.from(soul, { Cls, typeRef, incommingSync: true })
                : AccessObserver.observe(new Cls());

    opt.refs[id] = obj;

    // skipThoregon: skip only if it does not exist locally
    if (opt.restore || !(soul != undefined && (opt.skipThoregon || !EntityDecorator.materialized(soul)))) {
        Object.entries(props).forEach(([prop, ser]) => {
            if (prop.startsWith('@')) return;   // skip
            const value = ser?.startsWith('{') || ser?.startsWith("@ref:")
                          ? txdeserialize(ser, opt).obj
                          : deserialize(ser);
            (soul ? EntityDecorator : AccessObserver).primitiveSet(obj, prop, value);
        })
    }

    return { obj, refs: Object.values(opt.refs) };
}

// dot't serialize thoregon entities, reference them

//
// local serialize
//

export const localserialize = (obj, opt = {}) => {
    if (!isObject(obj)) return obj;
    if (!opt.excl) opt.excl = new Map();
    let id   = opt.excl.get(obj);
    if (id) return `'@ref:${id}'`;
    let type = classOrigin(obj);
    const $soul = obj.soul;
    id       = $soul ?? universe.random(5);
    opt.excl.set(obj, id);
    let str = `{ '@id': '${id}'`;
    if (!obj['@type']) str = `${str}, '@type': '${type}'`;
    if ($soul && !obj['@soul']) str = `${str}, '@soul': '${$soul}'`;

    let props = Reflect.ownKeys(obj);
    if (Array.isArray(obj)) props = props.filter(i => i !== 'length');

    // todo: loop over embedded when it is a ThoregonEntity
    props.forEach((name) => {
        if (isPrivateProperty(name) && name !== '_handle') return;
        if (obj.metaClass) {
            const prop = obj.metaClass.getAttribute(name);
            if (prop && (prop.emergent || prop.derived )) return;
        }
        if (opt.filter && !opt.filter(name, obj)) return;
        const item = Reflect.get(obj, name);
        if (isThoregon(item)) {
            // thoregon entity
            str = `${str}, '${name}': '@soul:${item.soul}'`;
        } else if (isRef(item) && !(isDate(item))) {
            // recursive
            str = `${str}, '${name}': ${localserialize(item, opt)}`;
        } else {
            // simple type
            str = `${str}, '${name}': '${serialize(item)}'`;
        }
    });

    return `${str} }`;
}

export const localdeserialize = (str, opt = {}) => {
    if (!isString(str)) return str;
    str = str.trim();
    if (str === '') return { obj: null, refs: [] };
    if (!str.startsWith('{')) return{ obj: deserialize(str), refs: [] };
    if (!opt.refs) opt.refs = {};
    if (str.startsWith("'@ref:")) {
        const id = "'" + str.substring(6);
        return opt.refs[id];
    }
    const props = {};
    const parts = codesplit(str.substring(1).slice(0,-1).trim(),',');
    parts.forEach((part) => {
        part = part.trim();
        const [name, value] = codesplit(part, ':');
        const prop = name.trim().substring(1).slice(0,-1);
        const propval = value?.trim();
        if (propval != undefined) props[prop] = propval.startsWith('{') ? propval : propval.substring(1).slice(0,-1);
    })

    const id = props['@id'];
    const soul = props['@soul'];
    let ref  = opt.refs[id];
    if (ref) return ref;

    const typeRef    = props['@type'] ?? 'builtin:Object';
    const { Cls } = origin2Class(typeRef);

    if (soul) { // when reference to thoregon entity, just return it
        const obj = EntityDecorator.from(soul, { Cls, typeRef });
        return { obj, refs: Object.values(opt.refs) };
    }

    let obj = new Cls();
    opt.refs[id] = obj;
    Object.entries(props).forEach(([prop, ser]) => {
        let value;
        if (ser.startsWith('@soul:')) {
            value = EntityDecorator.from(ser.substring(6), { /*Cls, typeRef, incommingSync: true*/ })  // maybe add Cls to soul ref, but entity must exist
        } else {
            if (prop.startsWith('@')) return;   // skip
            value = ser?.startsWith('{') || ser?.startsWith("@ref:")
                    ? localdeserialize(ser, opt).obj
                    : deserialize(ser);
        }
        Reflect.set(obj, prop, value);
    })

    obj = AccessObserver.observe(obj);

    return { obj, refs: Object.values(opt.refs) };
}

//
//
//


export const transportserialize = (obj, opt = {}) => {
    if (!isObject(obj)) return serialize(obj);
    if (!opt.excl) opt.excl = new Map();
    let id   = opt.excl.get(obj);
    if (id) return `'@ref:${id}'`;
    let type = classOrigin(obj);
    id       = obj.soul ?? universe.random(5);
    opt.excl.set(obj, id);
    let str = `{ '@id': '${id}', '@type': '${type}'`;
    if (obj.soul) str = `${str}, '@soul': '${obj.soul}'`;

    let props = Reflect.ownKeys(obj);
    if (Array.isArray(obj)) props = props.filter(i => i !== 'length');

    // todo: loop over embedded when it is a ThoregonEntity
    props.forEach((name) => {
        if (isPrivateProperty(name) && name !== '_handle') return;
        // if (obj.metaClass) {
        //     const prop = obj.metaClass.getAttribute(name);
        //     if (prop && (prop.emergent || prop.derived )) return;
        // }
        if (opt.filter && !opt.filter(name, obj)) return;
        const item = Reflect.get(obj, name);
        if (item?.soul) {
            // thoregon entity
            str = `${str}, '${name}': '@soul:${item.soul}'`;
        } else if (isRef(item) && !(isDate(item))) {
            // recursive
            str = `${str}, '${name}': ${transportserialize(item, opt)}`;
        } else {
            // simple type
            str = `${str}, '${name}': '${serialize(item)}'`;
        }
    });

    if (opt.withmethods && !Array.isArray(obj) && !obj.$isCollection) {
        const methodNames = [];
        const accessorNames = [];
        const methods = getAllMethodNamesCategorized(Object.getPrototypeOf(obj));
        if (obj.soul && !methods.delete) methodNames.push('delete');
        Object.entries(methods).forEach(([mthname, type]) => {
            if (excludeProperties(mthname)) return;
            if (type === 'method') {
                methodNames.push(mthname);
            } else {
                /*if (!Array.isArray(obj) || mthname === 'length') */accessorNames.push(mthname);
            }
        })
        str = `${str}, '@methods': '${methodNames.join(',')}', '@accessors': '${accessorNames.join(',')}'`;
    }

    return `${str} }`;
}

function transport2Obj(typeRef) {
    switch (typeRef) {
        case 'repo:/thoregon.archetim/lib/directory.mjs:Directory'   :
            return new RemoteDirectory();
        case 'repo:/thoregon.archetim/lib/collection.mjs:Collection' :
            return new RemoteCollection();
        case 'repo:/thoregon.truCloud/lib/unifiedfile/unifiedfiledescriptor.mjs:UnifiedFileDescriptor':
            return new RemoteFileDescriptor();
        case 'builtin:Array'                                         :
            return [];
        default                                                      :
            return {};
    }
}

export const transportdeserialize = async (str, opt = {}) => {
    if (!isString(str)) return str;
    str = str.trim();
    if (str === '') return '';
    if (!str.startsWith('{')) return deserialize(str);
    const tx = opt.tx;
    if (!opt.refs) opt.refs = {};
    if (str.startsWith("'@ref:")) {
        const id = "'" + str.substring(6);
        return opt.refs[id];
    }
    const props = {};
    const parts = codesplit(str.substring(1).slice(0,-1).trim(),',');
    parts.forEach((part) => {
        part = part.trim();
        const [name, value] = codesplit(part, ':');
        const prop = name.trim().substring(1).slice(0,-1);
        const propval = value?.trim();
        if (propval != undefined) props[prop] = propval.startsWith('{') ? propval : propval.substring(1).slice(0,-1);
    })

    const id = props['@id'];
    const soul = props['@soul'];
    let ref  = opt.refs[id];
    if (ref) return ref;

    const typeRef = props['@type'] ?? 'builtin:Object';
    const obj     = transport2Obj(typeRef);
    const refs    = {};
    const meta    = {};
    let methodNames, accessorNames;
    opt.refs[id]  = obj;

    const propentries = Object.entries(props);
    for await (const [prop, ser] of propentries) {
        let value;
        if (ser.startsWith('@soul:')) {
            const refsoul = ser.substring(6);
            if (soul) {
                refs[prop] = refsoul;
            } else {
                obj[prop] = await EntityDecorator.find(refsoul);
            }
        } else if (prop === '@methods') {
            methodNames = ser.split(',').filter((mthname) => !isPrivateProperty(mthname) && !excludeProperties(mthname));
        } else if (prop === '@accessors') {
            accessorNames = ser.split(',').filter((mthname) => !isPrivateProperty(mthname) && !excludeProperties(mthname));
        } else {
            if (prop.startsWith('@')) {
                meta[prop] = ser;
            } else {
                value = ser?.startsWith('{') || ser?.startsWith("@ref:")
                ? await transportdeserialize(ser, opt)
                : deserialize(ser);
                obj[prop] = value;
            }
        }
    }

    const observer = soul
                     ? EntityDecorator.recreate(soul, obj, refs, { meta, methodNames, accessorNames, ...opt })
                     : AccessObserver.observe(obj);

    return observer;
}

export const transportreqdeserialize = (str, opt = {}) => {
    if (!isString(str)) return str;
    str = str.trim();
    if (str === '') return '';
    if (!str.startsWith('{') && !str?.startsWith('[')) return deserialize(str);
    const tx = opt.tx;
    if (!opt.refs) opt.refs = {};
    if (str.startsWith("'@ref:")) {
        const id = "'" + str.substring(6);
        return opt.refs[id];
    }
    const props = {};
    const parts = codesplit(str.substring(1).slice(0,-1).trim(),',');
    parts.forEach((part) => {
        part = part.trim();
        const [name, value] = codesplit(part, ':');
        const prop = name.trim().substring(1).slice(0,-1);
        const propval = value?.trim();
        if (propval != undefined) props[prop] = propval.startsWith('{') || propval?.startsWith('[') ? propval : propval.substring(1).slice(0,-1);
    })

    const id = props['@id'];
    const soul = props['@soul'];
    if (soul) return EntityDecorator.from(soul);

    let ref  = opt.refs[id];
    if (ref) return ref;

    const typeRef = props['@type'] ?? 'builtin:Object';
    const obj     = transport2Obj(typeRef);
    const refs    = {};
    const meta    = {};
    let methodNames;
    opt.refs[id]  = obj;

    Object.entries(props).forEach(([prop, ser]) => {
        let value;
        if (ser.startsWith('@soul:')) {
            const refsoul = ser.substring(6);
            obj[prop] = EntityDecorator.isKnownEntity(refsoul) ? EntityDecorator.from(refsoul) : null;
//        } else if (prop === '@methods') {
//            methodNames = ser.split(',');
        } else {
            if (prop.startsWith('@')) {
                meta[prop] = ser;
            } else {
                value = ser?.startsWith('{') || ser?.startsWith('[') || ser?.startsWith("@ref:")
                        ? transportreqdeserialize(ser, opt)
                        : deserialize(ser);
                obj[prop] = value;
            }
        }
    })

    // const observer = soul
    //                  ? EntityDecorator.from(soul) //   .recreate(soul, obj, refs, { meta, methodNames, ...opt })
    //                  : AccessObserver.observe(obj);
    const observer = AccessObserver.observe(obj);

    return observer;
}

//
// Remote serialize
//

// todo: if top level object is no thoregon entity serialize nested
export const persistanceserialize = (obj, refs = {}, opt) => {
    if (!isObject(obj)) return obj;
    const soul =  obj['@soul'] ?? obj.soul;
    const type = classOrigin(obj);
    let str = `{ '@soul': '${soul}', '@type': '${type}'`;
    let props = Reflect.ownKeys(obj);
    let refProps = Object.keys(refs).filter((prop) => !props.includes(prop));
    if (Array.isArray(obj)) props = props.filter(i => i !== 'length');

    props.forEach((name) => {
        if (isPrivateProperty(name)) return;
        if (obj.metaClass) {
            const prop = obj.metaClass.getAttribute(name);
            if (prop && (prop.emergent || prop.derived )) return;
        }
        // if (filter && !filter(name, obj)) return;
        const item = Reflect.get(obj, name);
        if (item) {
            if (item.soul) {
                // thoregon entity
                str = `${str}, '${name}': '@soul:${item.soul}'`;
            } else {
                // simple type
                str = `${str}, '${name}': '${serialize(item)}'`;
            }
        }
    })
    refProps.forEach((name) => {
        const soul = refs[name];
        str = `${str}, '${name}': '@soul:${soul}'`;
    })

    return `${str} }`;
}

// todo: deserialize nested if top level ist not a thoregon entity
export const persistancedeserialize = (str, opt = {}) => {
    if (!isString(str)) return str;
    str = str.trim();
    if (str === '') return;
    if (!str.startsWith('{')) return deserialize(str);

    const props = {};
    const parts = codesplit(str.substring(1).slice(0,-1).trim(),',');
    parts.forEach((part) => {
        part = part.trim();
        const [name, value] = codesplit(part, ':');
        const prop = name.trim().substring(1).slice(0,-1);
        const propval = value?.trim();
        if (propval != undefined) props[prop] = propval.startsWith('{') ? propval : propval.substring(1).slice(0,-1);
    })

    const soul = props['@soul'];
    const typeRef    = props['@type'] ?? 'builtin:Object';
    const { Cls } = origin2Class(typeRef);
    const obj = Cls ? new Cls() : {};
    const refs = {};
    const meta = {};
    let methodNames;
    Object.entries(props).forEach(([prop, ser]) => {
        let value;
        if (ser.startsWith('@soul:')) {
            refs[prop] = ser.substring(6);
        } else if (prop === '@methods') {
            methodNames = ser.split(',');
        } else {
            if (prop.startsWith('@')) {
                meta[prop] = ser;
            } else {
                obj[prop] = deserialize(ser);
            }
        }
    })

    return { soul, obj, refs, meta, Cls };

    // const observer = EntityDecorator.recreate(soul, obj, refs, { meta, methodNames, ...opt });
    // return observer;
}


//
// neuland references
//

export const isSerializedRef = (str) => isString(str) && str.startsWith(S+'T|');

export const serializeRef = (obj) => {
    return isThoregon(obj)
            ? S + 'T|' + obj.soul + '|' + obj.classOrigin()
            : undefined;
}

export const deserializeRef = (str) => {
    if (!isString(str)) return;
    const parts = str.split('|');
    if (parts.length === 0) return;
    if (!parts[0].startsWith(S)) return;
    const selector = parts[0].substring(2);    // caution: because the 's͛' is a combined char it is 2 chars long
    if (selector !== 'T') return;
    const soul = parts[1];
    const ref  = parts[2];
    return { soul, ref };
}

//
// BASE64
//

export const isBase64 =  (str) => /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/.test(str);

const BASE64_MARKER = ';base64,';

export function isDataUrl(dataURI) {
    return dataURI.indexOf(BASE64_MARKER) > -1;
}

export function isURL(url) {
    try { return new URL(url) } catch (ignore) { return false }
}

export function getBase64DataOnly(dataURI) {
    var base64Index = dataURI.indexOf(BASE64_MARKER);
    if (base64Index < 0) return dataURI;
    var base64 = dataURI.substring(base64Index + BASE64_MARKER.length);
    return base64;
}

export function convertDataURIToBinary(dataURI) {
    var base64 = this.getBase64DataOnly(dataURI);
    var raw = atob(base64);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for(let i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }
    return array;
}


export function getFunctionParamsAndBody(fullfnstr) {
    // Removing spaces and splitting the string at the arrow (=>) to separate parameters and body
    const fnstr               = fullfnstr.replace(/\s/g, '');
    const [paramStr, bodyStr] = fnstr.split('=>');

    // Extracting parameter names by splitting at comma (,) if there are multiple parameters
    const params = paramStr
        .replace('(', '')
        .replace(')', '')
        .split(',')
        .filter((param) => param !== '');

    // Trimming the body and removing surrounding curly braces if present
    let body = bodyStr.trim();
    if (body.startsWith('{') && body.endsWith('}')) {
        body = body.slice(1, -1).trim();
    }

    return { params, body };
}

//
// deep serialize
// todo [OPEN]: introduce an AST parser for error free parsing of delimiters
//

/*

export async function deepSerialize(obj) {
}

export async function deepDeserialize(str) {
}
*/

const globalFns = {
    serialize,
    deserialize,
    serializeRef,
    deserializeRef,
    crystallize,
    decrystallize,
    simpleSerialize,
    canReference,
    isSerialized,
    isSerializedRef,
    codesplit,
    classOrigin,
    origin2Class,

    txserialize,
    txdeserialize,
}

if (globalThis.universe && !universe.ser) universe.$ser = globalFns;
