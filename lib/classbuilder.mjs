/**
 * Build a class dynamically
 *
 * todo:
 * - add consts
 * - private methods and properties
 * - static methods
 * - constructor with default values
 *
 * @author: Bernhard Lukassen
 */

export default class ClassBuilder {

    constructor({
                    name,
                    properties = {},
                    methods = {}
                } = {}) {
        Object.assign(this, { name, properties, methods });
    }

    /**
     * add a property name for the class.
     * overwrites property if it exists before.
     * @param name
     * @param {Any} defaultvalue - an arbitrary default value, undefined if omitted
     */
    addProperty(name, defaultvalue) {
        this.properties[name] = defaultvalue;
    }

    /**
     * add a method to the class.
     * overwrites method if it exists before.
     * @param name
     * @param fn
     */
    addMethod(name, fn) {
        this.methods[name] = fn;
    }

    build() {
        // get a class instance
        let C = ((defprops) => class {
            constructor(properties) {
                Object.assign(this, defprops, properties);
            }
        })(this.properties);
        // give it a name
        Object.defineProperty(C, 'name', { value: this.name });

        let CP = C.prototype;
        // define all methods
        Object.entries(this.methods).forEach(entry => {
            Object.defineProperty(CP, entry[0], {
                enumerable: false,
                configurable: false,
                writable: false,
                value: entry[1]
            });
        });

        return C;
    }
}
