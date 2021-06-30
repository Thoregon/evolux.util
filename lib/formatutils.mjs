/**
 *
 *
 * @author: Bernhard Lukassen
 */

const lpadspace  = (s, size) => s ? s.toString().padStart(size, ' ') : '';
const lpad0      = (s, size) => s ? s.toString().padStart(size, '0') : '';
const tf         = (dttm) => `${lpad0(dttm.getYear()+1900,4)}-${lpad0(dttm.getMonth()+1,2)}-${lpad0(dttm.getDate(),2)} ${lpad0(dttm.getHours(),2)}:${lpad0(dttm.getMinutes(),2)}:${lpad0(dttm.getSeconds(),2)}`;
// export const intf       = (num) => fthousends(Math.round(num));
// export const decf       = (num) => {

if (!String.prototype.asIdentifier) {
    Object.defineProperty(String.prototype, 'asIdentifier', {
        configurable: false,
        enumerable: false,
        value: function () {    // don't use as fat arrow function '() => {}', 'this' will be bound to undefined
            return this.replace(/[^a-zA-Z0-9]/g, "");
        }
    });
}

// export all formatting functions is a separate object
export default {
    lpadspace,
    lpad0,
    tf
}
