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
const toHex = (input) => {

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
const isClass = (obj) => {
    return !!(obj.prototype && obj.prototype.constructor && obj.prototype.constructor.toString().substring(0, 5) === 'class');
};

/**
 *
 * @param {object} obj - any JS object
 * @returns {string} classname
 */
const className = obj => Object.getPrototypeOf(obj).constructor.name;

/**
 *  get the dir and the name of the caller module
 */
/*
function getCallerDir(fnName) {
    let err = new Error();
    let stack = err.message.split('\n');
    for (let i in stack) {
        let item = stack[i];
        if (item.indexOf(fnName)) {
            let x = item.indexOf("(") + 1;
            let y = item.indexOf()
        }
    }
    return [null, null];
}
*/

module.exports = { toHex, isClass, className };
