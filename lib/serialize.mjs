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

import { isNil, isDate, isBoolean, isNumber, isString, isSymbol, isObject } from "/evolux.util/lib/objutils.mjs";

// serialization prefix
const S = 's͛';

//
// additional simple values and types to be serialized
//
export const isStream     = (obj) => false;       // todo
export const isFile       = (obj) => false;       // todo
export const isTypedArray = (obj) => obj instanceof Int8Array || obj instanceof Uint8Array || obj instanceof Uint8ClampedArray || obj instanceof Int16Array || obj instanceof Uint16Array || obj instanceof Int32Array || obj instanceof Uint32Array || obj instanceof Float32Array || obj instanceof Float64Array || obj instanceof BigInt64Array || obj instanceof BigUint64Array;
export const isSet        = (obj) => obj instanceof Set;
export const isMap        = (obj) => obj instanceof Map;
export const isError      = (obj) => obj instanceof Error /*|| (globalThis.DOMError ? obj instanceof DOMError : false)*/;   // todo [REFACTOR]: make is available also for headless (nodeJS) environments
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

// resolve Promises to store value!
export const isPromise  = (obj) => obj != null && typeof obj.then === 'function';
export const isFunction = (obj) => typeof obj === 'function';

//
// Thoregon Entities
//

export const isThoregon = (obj) => obj && !!obj.$thoregon;     // a persistent, decorated thoregon entity

//
// Reflection & Classes
//
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

//
// serialize/deserialize
//

const sinifinity = S + '∞';

export const simpleSerialize = (obj) => isSymbol(obj) || isString(obj) || isNumber(obj) || isBoolean(obj) || isDate(obj) || isTypedArray(obj) || isStream(obj) || isError(obj) || isRegExp(obj) /*|| isDocNode(obj)*/;  // todo [REFACTOR]: make is available also for headless (nodeJS) environments
export const canReference    = (obj) => !isFunction(obj) && !(obj instanceof WeakSet) && !(obj instanceof WeakRef) && !(obj instanceof DataView);    // reject also WebAssembly, SharedArrayBuffer, Generator, GeneratorFunction; also Proxies but this cannot be checked

export const isSerialized = (str) => str.startsWith(S);


export const classOrigin = (obj) => {
    let origin = dorifer.origin4cls(obj.constructor);
    origin = origin ? origin.repo : 'builtin:Object';
    return origin;
}

export const originAsClass = (origin) => {
    let Cls = dorifer.cls4origin(origin);
    let spec = Cls ? { Cls, repo: true } : { Cls: Object, repo: false };
    return spec;
}

// by default arrays and array like types stores each element as reference.
// can be overruled by defining the property in the metaclass as serialize: 'flat'.
// serializes also arrays and array like types on demand.

export const serialize = (obj) => {
    if (isNil(obj) || isString(obj) || isNumber(obj) || isBoolean(obj)) {
        return obj;
    } else if (isDate(obj)) {
        return S + 'D|' + obj.toISOString();
    } else if (isSymbol(obj)) {
        const gs = Symbol.keyFor(obj);
        return gs ? S + 'GS|' + gs : S + 'S|' + obj.toString().substr(7).slice(0,-1);
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
    if (!parts[0].startsWith(S)) return parts[0];
    const selector = parts[0].substr(2);    // caution: because the 's͛' is a combined char it is 2 chars long
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
            const eparts = entry.substr(1).slice(0,-1).split("=");
            if (type === 'Map') obj.set(JSON.parse(eparts[0]), JSON.parse(eparts[1])); else obj[JSON.parse(eparts[0])] = JSON.parse(eparts[1]);
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
export async function crystallize(obj) {
    if (isThoregon(obj)) {
        return S + 'T|' + await obj.soul;
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
               cryst += 't>' + await value.soul;
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

export async function decrystallize(str) {
    if (!isString(str)) return str;

    const parts = str.split('|');
    if (parts.length === 0) return;     // empty strings as undefined
    if (!parts[0].startsWith(S)) return parts[0];
    const selector = parts[0].substr(2);    // caution: because the 's͛' is a combined char it is 2 chars long

    if (selector === 'T') {     // Thoregon Entity
        const soul = parts[1];
        const obj = await universe.ThoregonObject.from(soul);
        return obj;
    } if (selector === 'TO') {  // Object eventually with thoregon entities as properties
        const attrs = parts[1].split(',').map(part => part.substr(1).slice(0,-1));
        const obj = {};
        for await (const attr of attrs) {
            const [name, value] = attr.split('=');
            let deserialized;
            if (value.startsWith('t>')) {
                deserialized = await universe.ThoregonObject.from(value.substr(2));
            } else {
                deserialized = JSON.parse(value.substr(2));
            }
            Reflect.set(obj, name, deserialized);
        }
        return obj;
    } if (selector === 'TA') {  // Array eventually with thoregon entities as items
        const items = parts[1].split(',').map(part => part.substr(1).slice(0,-1));
        const ary = [];
        for await (const item of items) {
            let deserialized;
            if (item.startsWith('t>')) {
                deserialized = await universe.ThoregonObject.from(item.substr(2));
            } else {
                deserialized = JSON.parse(item.substr(2));
            }
            ary.push(deserialized);
        }
        return ary;
    } else {
        return deserialize(str);
    }
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

if (globalThis.universe) {
    if (!universe.serialize)     universe.$serialize     = serialize;
    if (!universe.deserialize)   universe.$deserialize   = deserialize;
    if (!universe.crystallize)   universe.$crystallize   = crystallize;
    if (!universe.decrystallize) universe.$decrystallize = decrystallize;
    // if (!universe.deepSerialize)     universe.$deepSerialize     = deepSerialize;
    // if (!universe.deepDeserialize)   universe.$deepDeserialize   = deppDeserialize;
}
