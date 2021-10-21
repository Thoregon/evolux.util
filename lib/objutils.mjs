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

if (!Array.aForEach) Object.defineProperty(Array.prototype, 'aForEach', {
    configurable: false,
    enumerable: false,
    // writable: false,
    value: async function aForEach(fn) {    // don't use () => {} because it binds this to undefined!
        for await ( let item of this ) {
            await fn(item);
        }
    }
})

if (!Array.aFind) Object.defineProperty(Array.prototype, 'aFind', {
    configurable: false,
    enumerable: false,
    // writable: false,
    value: async function aFind(fn) {    // don't use () => {} because it binds this to undefined!
        for await ( let item of this ) {
            let found = await fn(item);
            if (found) return item;
        }
    }
})
