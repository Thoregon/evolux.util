/**
 *
 *
 * @author: Bernhard Lukassen
 */

// todo: add class hierarchy helper like
//  Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(anObject))).constructor.name

/**
 * Returns an object containing only the properties requested from 'source' object
 * @param source
 * @param props
 * @return {Object}
 */
export const useprops = (source, ...props) => {
    const target = {};
    props.forEach(prop => { if(source[prop]) target[prop] = source[prop] });
    return target;
};

//
// Functions & Promises
//

export const isPromise  = (obj) => obj != null && typeof obj.then === 'function';
export const isFunction = (obj) => obj != null && typeof obj === 'function';

//
// type functions
//

export const isString    = (obj) => (typeof obj === 'string') || (obj instanceof String);
export const isNil       = (obj) => obj == undefined;   // don't replace with '===', checks for 'undefined' and 'null'
export const isUndefined = (obj) => obj === undefined;
export const isNull      = (obj) => obj === null;
export const isNumber    = (obj) => (typeof obj === 'number') || (obj instanceof Number);
export const isSymbol    = (obj) => (typeof obj === 'symbol') || (obj instanceof Symbol);
export const isBigint    = (obj) => (typeof obj === 'bigint') || (obj instanceof BigInt);
export const isBoolean   = (obj) => (typeof obj === 'boolean') || (obj instanceof Boolean);
export const isDate      = (obj) => (obj instanceof Date);   // extend with Temporal when available -> https://github.com/tc39/proposal-temporal
export const isObject    = (obj) => !isString(obj) && !isNumber(obj) && !isSymbol(obj) && !isBigint(obj) && !isBoolean(obj) && !isUndefined(obj);
export const isPrimitive = (test) => test !== Object(test);
export const isError      = (obj) => obj instanceof Error /*|| (globalThis.DOMError ? obj instanceof DOMError : false)*/;   // todo [REFACTOR]: make is available also for headless (nodeJS) environments

//
// compare functions
//

/**
 * compare specified properties between two objects
 * compares only 'simple' properties to equality.
 * obj1 is the 'current' object, 'obj2' may contain changes
 * returns an object with changed properties and values from obj2
 * does not check if a property exists in obj1 but not in obj2 anymore
 * if props not specified, all properties from obj2 will be compared
 *
 * @param obj1
 * @param obj2
 * @param props
 * @return {Object}
 */
export async function changedProps(obj1, obj2, props) {
    const names = props ?? Object.keys(obj2);
    const changes = {};

    for await (const prop of props) {
        const val1 = await Reflect.get(obj1, prop);
        const val2 = await Reflect.get(obj2, prop);
        if (val1 !== val2) changes[prop] = val2;
    }

    return changes.is_empty ? undefined : changes;
}

export async function removedProps(obj1, obj2) {
    // todo
}

// todo [OPEN]: deep changedProps


//
// collection polyfills
//

if (!Array.prototype.is_empty) Object.defineProperty(Array.prototype, 'is_empty', {
    configurable: false,
    enumerable: false,
    // writable: false,
    get: function () {
        return this.length === 0;
    }
})

if (!Object.prototype.is_empty) Object.defineProperty(Object.prototype, 'is_empty', {
    configurable: false,
    enumerable: false,
    // writable: false,
    get: function () {
        return Object.keys(this).length === 0;
    }
})

if (!Array.prototype.unique) Object.defineProperty(Array.prototype, 'unique', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function() {
        var a = this.concat();
        for(var i=0; i<a.length; ++i) {
            for(var j=i+1; j<a.length; ++j) {
                if(a[i] === a[j])
                    a.splice(j--, 1);
            }
        }

        return a;
    }
})

if (!Array.toObject) Object.defineProperty(Array.prototype, 'toObject', {
    configurable: false,
    enumerable: false,
    // writable: false,
    value: function (propkey, propval) {    // don't use () => {} because it binds this to undefined!
            return this.reduce((obj, item, i) => {
                let key = item[propkey] || `${i}`;
                obj[key] = item[propval];
                return obj;
            }, {});
    }
})

if (!Array.toEnum) Object.defineProperty(Array.prototype, 'toEnum', {
    configurable: false,
    enumerable: false,
    // writable: false,
    value: function () {    // don't use () => {} because it binds this to undefined!
        return this.reduce((obj,item,i) => { obj[item] = item; return obj; },{}) ;
    }
})

if (!Array.asyncForEach) Object.defineProperty(Array.prototype, 'asyncForEach', {
    configurable: false,
    enumerable: false,
    // writable: false,
    value: async function asyncForEach(fn) {    // don't use () => {} because it binds this to undefined!
        for await (const item of this) {
            await fn(item);
        }
    }
})

if (!Array.asyncFind) Object.defineProperty(Array.prototype, 'asyncFind', {
    configurable: false,
    enumerable: false,
    // writable: false,
    value: async function asyncFind(fn) {    // don't use () => {} because it binds this to undefined!
        for await (const item of this) {
            let found = await fn(item);
            if (found) return item;
        }
    }
})

//
// logging & verifications
//

/**
 * save get logger, contains always an object understanding the logger protocol (log, info, debug, warn, error)
 * @type {Logger}
 */
export const logger = /*universe.logger ??*/ console;

/**
 * simple parsing of key value pairs
 * simmilar to JS
 * dont use ';' and ',' in texts, pares will fail
 * @return {Object}     object with properties and values, if string is empty or no key values returns undefined
 */

export const fromKVString = (string) => {
    if (!string) return;
    const parts = string.split(',');
    if (parts.length < 1) return;
    let json    = '{';
    let sep     = '';
    parts.forEach(part => {
        const kv = part.split(':');
        if (kv.length !== 2) return ;
        json += sep + '"' + kv[0] + '" : ' + kv[1];
        sep = ',';
    });
    json += '}';
    return JSON.parse(json);
}

/**
 * use to check if anything (e.g. a param) is undefined.
 *
 *    if (missing(isAdmin, "need admin permission")) return;
 *
 * if the condition is true it returns false.
 * otherwise
 *  if the message is an Error it will be thrown.
 *  or log (logger.debug) the message and return true
 *
 * @param {boolean|Function} cond
 * @param {String|Error} message
 * @return {boolean}
 */
export const missing = (cond, message) => {
    const res = !(isFunction(cond) ? cond() : cond);
    if (res) return false;
    if (isError(message)) throw message;
    if (message) logger.debug(message);
    return true
}

/**
 * async missing. same a missing but async
 *
 * @param cond
 * @param message
 * @return {Promise<boolean>}
 */
export const amissing = async (cond, message) => {
    cond = !(isFunction(cond) ? await cond() : await cond);
    return expect(cond, message);
}

