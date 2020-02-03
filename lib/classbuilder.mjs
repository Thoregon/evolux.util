/**
 * Build a class dynamically
 *
 * Usage:
 ```
     import { ClassBuilder } from '/evolux.util';

     const cb = new ClassBuilder({
        name: 'Test',
        extend: Object,
        properties: { a: 'A', b: 'B' },
        methods: {
            test1() { return `test1 ${this.a}`; },
            test2() { return `test2 ${this.b}`; } }
    });

    const Test = cb.build();

    let test = new Test();
```
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
                    constructor,
                    properties = {},
                    consts     = {},
                    methods = {},
                    extend
                } = {}) {
        Object.assign(this, { name, constructor, properties, consts, methods, extend });
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
        // prepare properties and constants
        let props   = {};
        let consts  = {};

        // define properties
        Object.entries(this.properties).forEach(([pname, value]) => {
            props[pname] = {
                enumerable: true,
                configurable: true,
                writable: true,
                value: value
            };
        });

        // define consts
        Object.entries(this.consts).forEach(([cname, value]) => {
            consts[cname] = {
                enumerable: true,
                configurable: false,
                writable: false,
                value: value
            };
        });

        // get a class instance
        let C = ((base, contructfn, _consts, _props) => class extends (base || Object) {
            constructor() {
                super();
                Object.defineProperties(this, _consts);
                Object.defineProperties(this, _props);
                if (contructfn) contructfn.apply(this, arguments);
            }
        })(this.extend, this.constructor, consts, props);
        // give it a name
        Object.defineProperty(C, 'name', { value: this.name });

        let CP = C.prototype;

        // define all methods
        Object.entries(this.methods).forEach(([fnname, fn]) => {
            Object.defineProperty(fn, 'name', { value: fnname });
            Object.defineProperty(CP, fnname, {
                enumerable: false,
                configurable: false,
                writable: false,
                value: fn
            });
        });

        return C;
    }
}
