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

/**
 * Deep check if obj is a String
 * @param obj
 * @return {boolean}
 */
export const isString = (obj) => (typeof obj === 'string') || (obj instanceof String);

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
