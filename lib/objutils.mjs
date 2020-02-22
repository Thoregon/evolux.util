/**
 *
 *
 * @author: Bernhard Lukassen
 */

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
