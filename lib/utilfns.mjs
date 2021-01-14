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

/**
 *
 * @param fn        function to wait for
 * @param timeout   ms timeout
 */
export const atimeout = /*async*/ (fn, timeout) => {
    return new Promise(async (resolve, reject) => {
        let t = setTimeout(() => {
            reject();
        }, timeout);
        try {
            let result = await fn();
            resolve(result);
        } catch(e) {
            reject(e);
        } finally {
            clearTimeout(t);
        }
    });
}

export const aretry = /*async*/ (fn, { retries, interval } ) => {
    interval = interval || 500;
    retries = retries || 5;
    let ok = false;
    return new Promise(async (resolve, reject) => {
        while (!ok && retries-- > 0) {
            try {
                let result = await atimeout(fn, interval);
                ok = true;
                resolve(result);
            } catch (e) {
                if (e) {
                    retries = 0;
                    reject(e);
                } // otherwise timeout, try again
            }
        }
        if (retries < 1) reject();
    })
}
