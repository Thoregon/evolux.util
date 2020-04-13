/**
 *
 *
 * @author: Bernhard Lukassen
 */

const septh = '.';      // thousends separator  todo: move to settings
const sepdec = ',';     // decimals separator  todo: move to settings

export const lpadspace  = (s, size) => s.toString().padStart(size, ' ');
export const lpad0      = (s, size) => s.toString().padStart(size, '0');
export const tf         = (dttm) => `${lpad0(dttm.getYear()+1900,4)}-${lpad0(dttm.getMonth()+1,2)}-${lpad0(dttm.getDate(),2)} ${lpad0(dttm.getHours(),2)}:${lpad0(dttm.getMinutes(),2)}:${lpad0(dttm.getSeconds(),2)}`;
// export const intf       = (num) => fthousends(Math.round(num));
// export const decf       = (num) => {
