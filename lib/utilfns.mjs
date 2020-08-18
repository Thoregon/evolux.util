/**
 * Just one more collection of utils
 *
 * @author: blukassen
 */

/**
 * convert integer to hex string
 *
 * @param {number} input
 * @returns {string} hex representation
 */
export const toHex = (input) => {
    let hash = "",
        alphabet = "0123456789ABCDEF",
        alphabetLength = alphabet.length;
    do {
        hash = alphabet[input % alphabetLength] + hash;
        input = parseInt(input / alphabetLength, 10);
    } while (input);

    return hash;
};

/*
  Som utility functions for ES5 classes
 */

/**
 * tell if the given object is a Class
 * works only for native ES5 classes
 *
 * @param {object} obj
 * @returns {boolean}
 */
export const isClass = (obj) => {
    return !!(obj.prototype && obj.prototype.constructor && obj.prototype.constructor.toString().substring(0, 5) === 'class');
};

/**
 * simply check if a given object is a function
 * @param obj
 * @return {boolean}
 */
export const isFunction    = (obj) => typeof(obj) === 'function';

/**
 *
 * @param {object} obj - any JS object
 * @returns {string} classname
 */
export const className = obj => Object.getPrototypeOf(obj).constructor.name;

/**
 * lopps async over a collection
 * @param collection
 * @param fn                async function
 * @return {Promise<void>}
 */
export const forEach = async (collection, fn) => {
    if (!collection || !Array.isArray(collection)) return ;
    for (let index = 0; index < collection.length; index++) {
        await fn(collection[index], index, collection);
    }
};


