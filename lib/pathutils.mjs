/**
 * Utils for easier path handling
 *
 * @author: Bernhard Lukassen
 */

/**
 * get the last path element
 * @param path
 * @return {*}
 */
export const last = (path) => Array.isArray(path) ? path[path.length-1] : path.toString().split('.').pop();

/**
 * return an array with path elements of the pathname
 * @param path
 * @return {string[]}
 */
export const elems = (path) => path.toString().split('.');

/**
 * Return the path elements w/o last.
 * @param path
 * @return {Array}
 */
export const parent = (path) => { let items = elems(path); items.pop(); return items; };

/**
 * retuns the path as as array with 2 elements.
 * - 0 ... path elements of the parent
 * - 1 ... last element (name)
 * @param path
 * @return {Array}
 */
export const parts = (path) => { let items = elems(path); let last = items.pop(); return [items, last]; };

export const propertywithpath = (obj, path) => {
    if (!path) return;
    let parts = Array.isArray(path) ? path : parts(path);
    if (parts.length === 0) return;
    let sub = obj[parts[0]];
    return (parts.length > 1) ? propertywithpath(sub, (parts.shift(), parts)): sub;
}
