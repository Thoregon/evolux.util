/**
 *
 *
 * @author: Bernhard Lukassen
 */

export const useprops = (source, ...props) => {
    const target = {};
    props.forEach(prop => { if(source[prop]) target[prop] = source[prop] });
    return target;
};
