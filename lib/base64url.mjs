/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

const tob64 = globalThis.atob
                ? (data) => btoa(unescape(encodeURIComponent(data)))
                : (data) => Buffer.from(data, 'utf8').toString('base64');
const fromb64 = globalThis.btoa
                ? (data) => decodeURIComponent(escape(atob(data)))
                : (data) => Buffer.from(data, 'base64').toString('utf8');

const b64unescape = (data) => (data + '==='.slice((data.length + 3) % 4))
                            .replace(/-/g, '+')
                            .replace(/_/g, '/');

const b64escape = (data) => data.replace(/\+/g, '-')
                             .replace(/\//g, '_')
                             .replace(/=/g, '');

export default {
    encode: (data) => b64escape(tob64(data)),
    decode: (data) => fromb64(b64unescape(data)),


}
