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
export const pathparts = (path) => { let items = elems(path); let next = items.shift(); return [next, items]; };

export const propertywithpath = (obj, path) => {
    if (!path) return;
    let parts = Array.isArray(path) ? path : pathparts(path);
    if (parts.length === 0) return;
    let sub = obj[parts[0]];
    return (parts[1].length > 0) ? propertywithpath(sub, [parts[1].shift(), parts[1]]): sub;
}

export const propWithPath = (obj, path) => {
    if (!path) return obj;
    let parts = Array.isArray(path) ? path : elems(path);
    if (parts.length === 0) return;
    const prop = parts.shift();
    let sub = obj[prop];
    return sub == undefined ? undefined : (parts.length > 0) ? propWithPath(sub, parts): sub;
}

export const asyncWithPath = async (obj, path) => {
    if (!path) return obj;
    let parts = Array.isArray(path) ? path : pathparts(path);
    if (parts.length === 0) return;
    let sub = await obj[parts[0]];
    return sub == undefined ? undefined : (parts[1].length > 0) ? await asyncWithPath(sub, [parts[1].shift(), parts[1]]): sub;
}

export const probe = async (obj, name, indent = '') => {
    if (typeof obj !== 'object') {
        console.log(indent, name ?? '', ':', obj ? obj.toString() : '<undefined>');
        return;
    }
    const props = obj.$thoregonEntity ? [...obj.$keys] : Object.keys(obj);
    console.log(indent, name ?? '', '>', obj.constructor.name);
    for await (const prop of props) {
        const val = await obj[prop];
        await probe(val, prop,indent+'   ');
    }
}

if (!globalThis.probe) globalThis.probe = probe;

/**
 * A simple analog of Node.js's `path.join(...)`.
 * https://gist.github.com/creationix/7435851
 * @param  {...string} segments
 * @return {string}
 */

export function joinPath(...segments) {
    // Split the inputs into a list of path commands.
    var parts = [];
    for (var i = 0, l = segments.length; i < l; i++) {
        parts = parts.concat(segments[i].split("/"));
    }
    // Interpret the path commands to get the new resolved path.
    var newParts = [];
    for (i = 0, l = parts.length; i < l; i++) {
        var part = parts[i];
        // Remove leading and trailing slashes
        // Also remove "." segments
        if (!part || part === ".") continue;
        // Interpret ".." to pop the last segment
        if (part === "..") newParts.pop();
        // Push new path segments.
        else newParts.push(part);
    }
    // Preserve the initial slash if there was one.
    if (parts[0] === "") newParts.unshift("");
    // Turn back into a single string path.
    return newParts.join("/") || (newParts.length ? "/" : ".");
}

/**
 * A simple analog of Node.js's `path.join(...)`.
 * https://gist.github.com/creationix/7435851#gistcomment-3698888
 * @param  {...string} segments
 * @return {string}
 */
export function joinPath_(...segments) {
    const parts = segments.reduce((parts, segment) => {
        // Remove leading slashes from non-first part.
        if (parts.length > 0) {
            segment = segment.replace(/^\//, '')
        }
        // Remove trailing slashes.
        segment = segment.replace(/\/$/, '')
        return parts.concat(segment.split('/'))
    }, [])
    const resultParts = []
    for (const part of parts) {
        if (part === '.') {
            continue
        }
        if (part === '..') {
            resultParts.pop()
            continue
        }
        resultParts.push(part)
    }
    return resultParts.join('/')
}
