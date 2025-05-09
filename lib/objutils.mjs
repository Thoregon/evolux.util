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
export const isObject    = (obj) => !isNil(obj) && typeof obj === 'object'; // !isString(obj) && !isNumber(obj) && !isSymbol(obj) && !isBigint(obj) && !isBoolean(obj) && !isFunction(obj) && !isPromise(obj) && !isUndefined(obj);
export const isPrimitive = (val) => val !== Object(val);
export const isError     = (obj) => obj instanceof Error /*|| (globalThis.DOMError ? obj instanceof DOMError : false)*/;   // todo [REFACTOR]: make is available also for headless (nodeJS) environments
export const isRef       = (obj) => isObject(obj); // this includes also arrays
export const isVal       = (obj) => isPrimitive(obj);
export const isArray     = (ary) => Array.isArray(ary);

export const isEmpty     = (val) => isNil(val) || val === '';
//
// helpers
//

export const invert = (source) => (Object.entries(source).reduce((result, [ key, value ]) => ({ ...result, [value]: key }), {}));

export const isObserved = (obj) => universe.ThoregonDecorator.isObserved(obj);

//
// object
//

export function objectWOnull(obj) {
    return Object.fromEntries(
        Object.entries(obj).filter(([, value]) => value != undefined)
    );
}

export function mergeObjects(obj1, obj2) {
    return { ...filterObject(obj1), ...filterObject(obj2) };
}


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
    const names = props ?? Reflect.ownKeys(obj2);
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
// Consts
//

export const EMPTY_ITERATOR = {
    [Symbol.asyncIterator]() {
        return { async next() { return { done: true } } }
    }
};

//
// collection polyfills
//

if (!Array.prototype.hasOwnProperty('is_empty')) Object.defineProperty(Array.prototype, 'is_empty', {
    configurable: false,
    enumerable: false,
    // writable: false,
    get: function () {
        return this.length === 0;
    }
})

if (!Object.prototype.hasOwnProperty('is_empty')) Object.defineProperty(Object.prototype, 'is_empty', {
    configurable: false,
    enumerable: false,
    // writable: false,
    get: function () {
        return Object.keys(this).length === 0;
    }
})

if (!Array.prototype.hasOwnProperty('remove')) Object.defineProperty(Array.prototype, 'remove', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function (item) {
        const i = this.indexOf(item);
        if (i > -1) this.splice(i,1);
        return this;
    }
})

if (!Array.prototype.hasOwnProperty('unique')) Object.defineProperty(Array.prototype, 'unique', {
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

if (!Array.prototype.hasOwnProperty('toObject')) Object.defineProperty(Array.prototype, 'toObject', {
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

if (!Array.prototype.hasOwnProperty('toEnum')) Object.defineProperty(Array.prototype, 'toEnum', {
    configurable: false,
    enumerable: false,
    // writable: false,
    value: function () {    // don't use () => {} because it binds this to undefined!
        return this.reduce((obj,item,i) => { obj[item] = item; return obj; },{}) ;
    }
})

if (!Array.prototype.hasOwnProperty('asyncForEach')) Object.defineProperty(Array.prototype, 'asyncForEach', {
    configurable: false,
    enumerable: false,
    // writable: false,
    value: async function asyncForEach(fn) {    // don't use () => {} because it binds this to undefined!
        for await (const item of this) {
            await fn(item);
        }
    }
})

if (!Array.prototype.hasOwnProperty('asyncFind')) Object.defineProperty(Array.prototype, 'asyncFind', {
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

//
// deep apply ... apply properties from an object on a supplied template
//                only the properties existing on the template will be copied
// deep merge ... apply only changed and added properties,keep existing

//
// microdiff
//
const richTypes = { Date: true, RegExp: true, String: true, Number: true };
export function deepdiff(
    obj = {},
    newObj = {},
    { cyclesFix = true, apply = false, merge = false } = {},
    _stack = []
) {
    let diffs = [];
    const isObjArray = Array.isArray(obj);
    for (const key in obj) {
        const objKey = obj[key];
        const path = isObjArray ? +key : key;
        if (!(key in newObj)) {
            diffs.push({
                           type: "REMOVE",
                           path: [path],
                           oldValue: obj[key],
                       });
            if (!merge && apply) delete obj[key];
            continue;
        }
        const newObjKey = newObj[key];
        const areObjects =
                  typeof objKey === "object" && typeof newObjKey === "object";
        if (
            objKey &&
            newObjKey &&
            areObjects &&
            !richTypes[Object.getPrototypeOf(objKey)?.constructor?.name] &&
            (!cyclesFix || !_stack.includes(objKey))
        ) {
            const nestedDiffs = deepdiff(
                objKey,
                newObjKey,
                { cyclesFix,  apply, merge },
                cyclesFix ? _stack.concat([objKey]) : []
            );
            diffs.push.apply(
                diffs,
                nestedDiffs.map((difference) => {
                    difference.path.unshift(path);
                    return difference;
                })
            );
        } else if (
            objKey !== newObjKey &&
            !(
            areObjects &&
            (isNaN(objKey)
             ? objKey + "" === newObjKey + ""
             : +objKey === +newObjKey)
            )
        ) {
            diffs.push({
                           path: [path],
                           type: "CHANGE",
                           value: newObjKey,
                           oldValue: objKey,
                       });
            if (merge || apply) obj[key] = newObj[key];
        }
    }
    const isNewObjArray = Array.isArray(newObj);
    for (const key in newObj) {
        if (!(key in obj)) {
            diffs.push({
                           type: "CREATE",
                           path: [isNewObjArray ? +key : key],
                           value: newObj[key],
                       });
            if (merge || apply) {
                let val = newObj[key];
                if (typeof val === "object") {
                    let newVal = val;
                    val = universe.isObserved(obj) ? obj.observerClass().observe({}) : Array.isArray(newVal) ? [] : {};
                    deepdiff(val, newVal, { cyclesFix, apply, merge });
                }
                obj[key] = val;
            }
        }
    }
    return diffs;
}

export const baredeepcopy = (newObj) => {
    const obj = {};
    const diffs = deepdiff(obj, newObj, { apply: true });
    return obj;
}

/**
 * Creates a shallow copy of the given object without properties that are undefined or null.
 * @param {Object} obj - The object to be copied and cleaned.
 * @returns {Object} - A new object without undefined or null properties.
 */
export function cleanObject(obj) {
    return Object.fromEntries(
        Object.entries(obj).filter(([_, value]) => value !== undefined && value !== null)
    );
}

//
// compare
//

export const setEqual = (as, bs) =>
    as.size === bs.size &&
    [...as].every((x) => bs.has(x));

export const compare = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// from: https://stackoverflow.com/questions/1068834/object-comparison-in-javascript
export const deepCompare = (...args) => {
    let i, l, leftChain, rightChain;

    function compare2Objects (x, y) {
        var p;

        // remember that NaN === NaN returns false
        // and isNaN(undefined) returns true
        if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
            return true;
        }

        // Compare primitives and functions.
        // Check if both arguments link to the same object.
        // Especially useful on the step where we compare prototypes
        if (x === y) {
            return true;
        }

        // Works in case when functions are created in constructor.
        // Comparing dates is a common scenario. Another built-ins?
        // We can even handle functions passed across iframes
        if ((typeof x === 'function' && typeof y === 'function') ||
            (x instanceof Date && y instanceof Date) ||
            (x instanceof RegExp && y instanceof RegExp) ||
            (x instanceof String && y instanceof String) ||
            (x instanceof Number && y instanceof Number)) {
            return x.toString() === y.toString();
        }

        // At last checking prototypes as good as we can
        if (!(x instanceof Object && y instanceof Object)) {
            return false;
        }

        if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
            return false;
        }

        if (x.constructor !== y.constructor) {
            return false;
        }

        if (x.prototype !== y.prototype) {
            return false;
        }

        // Check for infinitive linking loops
        if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
            return false;
        }

        // Quick checking of one object being a subset of another.
        // todo: cache the structure of arguments[0] for performance
        for (p in y) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            }
            else if (typeof y[p] !== typeof x[p]) {
                return false;
            }
        }

        for (p in x) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            }
            else if (typeof y[p] !== typeof x[p]) {
                return false;
            }

            switch (typeof (x[p])) {
                case 'object':
                case 'function':

                    leftChain.push(x);
                    rightChain.push(y);

                    if (!compare2Objects (x[p], y[p])) {
                        return false;
                    }

                    leftChain.pop();
                    rightChain.pop();
                    break;

                default:
                    if (x[p] !== y[p]) {
                        return false;
                    }
                    break;
            }
        }

        return true;
    }

    if (args.length < 1) {
        return true;
        // or: throw "Need two or more args to compare";
    }

    for (i = 1, l = args.length; i < l; i++) {

        leftChain = []; //Todo: this can be cached
        rightChain = [];

        if (!compare2Objects(args[0], args[i])) {
            return false;
        }
    }

    return true;
}

export function callStack() {
    try {
        throw new Error("stack")
    } catch (e) {
        return e.stack.split("\n");
    }
}


//
// date functions
//

export function getToday(date) {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());;
    return dateOnly;
}

/**
 * Compare two dates by their date‐parts only (ignoring time).
 * @param {Date|string|number} date1 – first date (Date object, ISO string, or timestamp)
 * @param {Date|string|number} date2 – second date
 * @returns {number} -1 if date2 < date1, 0 if equal, 1 if date2 > date1
 */
export function compareDates(date1, date2) {
    // build new dates at midnight (local time) to drop hours/minutes/etc.
    const only1 = getToday(date1);
    const only2 = getToday(date2);

    const t1 = only1.getTime();
    const t2 = only2.getTime();

    if (t2 < t1) return -1;
    if (t2 > t1) return 1;
    return 0;
}
