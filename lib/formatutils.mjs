/**
 *
 *
 * @author: Bernhard Lukassen
 */

export const lpadspace  = (s, size) => s ? s.toString().padStart(size, ' ') : '';
export const lpad0      = (s, size) => s ? s.toString().padStart(size, '0') : '';
export const tf         = (dttm) => `${lpad0(dttm.getYear()+1900,4)}-${lpad0(dttm.getMonth()+1,2)}-${lpad0(dttm.getDate(),2)} ${lpad0(dttm.getHours(),2)}:${lpad0(dttm.getMinutes(),2)}:${lpad0(dttm.getSeconds(),2)}`;
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

// convert kebab case (e.g. a tagname) to camel case name
export const kebap2camelCase = (kebap) => kebap.split('-').map(name => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()).join('');
// remove the extension from a filename
export const filename = (filename) => filename.split('.').slice(0, -1).join('.');

export const parseTplString = (template, i = 0) => {
    let fns = [];
    let definition = template?.replace(/\${([^}]+)}/g, (def, js) => {
        fns.push(js);
        return `@[${i++}]`;
    });
    return { definition, fns };
}

/**
 * replaces params in strings
 * side effect: removes used params from the params array
 * @param template
 * @param params
 * @return {*}
 */
export const replaceTplString = (template, params) => {
    if (!template) return;
    let result = template.replace(/@\[.+?\]/g, () => params.shift());
    return result;
}

// todo [REFCTOR]: make one reg ex instead of three
const RX_I18N_FULL         = /(.+)\((.+)\)\|(.+)/;
const RX_I18N_REPLACEMENTS = /(.+)\((.+)\)/;
const RX_I18N_DEFAULT      = /(.+)\|(.+)/;

function splitSubToken(token) {
    const i = token.indexOf('.');
    if (i < 0) return { token, subkey: undefined };
    const subkey = token.substring(i+1);
    token = token.substring(0, i);
    return { token, subkey };
}

export const parseI18N = (template) => {
    let match;

    // test the full I18N defintion
    match = template.match(RX_I18N_FULL);
    if (match) {
        const i18nAttribute                           = match[1];
        let keys                                      = splitSubToken(match[1]);   // first match is the token
        const { definition: token, fns: tfns }        = parseTplString(keys.token);
        const { definition: subkey, fns: sfns }       = parseTplString(keys.subkey);
        const { definition: replacements, fns: rfns } = parseTplString(match[2]);   // second match are the replacements
        const defaultText                             = match[3];   // third match is the default
        return { defaultText, i18nAttribute, token, subkey, replacements, fns: [...tfns, ...sfns, ...rfns] };  // i18nSpan     : '<span aurora-i18n="'+ i18nAttribute +'">'+ defaultText +'</span>'
    }

    // test I18N w/o default but with replacements
    match = template.match(RX_I18N_REPLACEMENTS);
    if (match) {
        const i18nAttribute                           = match[1];
        let keys                                      = splitSubToken(match[1]);   // first match is the token
        const { definition: token, fns: tfns }        = parseTplString(keys.token);
        const { definition: subkey, fns: sfns }       = parseTplString(keys.subkey);
        const { definition: replacements, fns: rfns } = parseTplString(match[2]);   // second match are the replacements
        return { i18nAttribute, token, subkey, replacements, defaultText: undefined, fns: [...tfns, ...sfns, ...rfns] };  // i18nSpan     : '<span aurora-i18n="'+ i18nAttribute +'">'+ defaultText +'</span>'
    }

    // test I18N w/o replacements but with default
    match = template.match(RX_I18N_DEFAULT);
    if (match) {
        const i18nAttribute                           = match[1];
        let keys                                      = splitSubToken(match[1]);   // first match is the token
        const { definition: token, fns: tfns }        = parseTplString(keys.token);
        const { definition: subkey, fns: sfns }       = parseTplString(keys.subkey);
        const defaultText                             = match[2];   // third match is the default
        return { defaultText, i18nAttribute, token, subkey, replacements: undefined, fns: [...tfns, ...sfns] };  // i18nSpan     : '<span aurora-i18n="'+ i18nAttribute +'">'+ defaultText +'</span>'
    }

    const i18nAttribute     = template;
    let keys                                          = splitSubToken(template);   // first match is the token
    const { definition: token, fns: tfns }            = parseTplString(keys.token);
    const { definition: subkey, fns: sfns }           = parseTplString(keys.subkey);
    return { i18nAttribute, token, subkey, defaultText: undefined, replacements: undefined, fns: [...tfns, ...sfns] };  // i18nSpan     : '<span aurora-i18n="'+ i18nAttribute +'">'+ defaultText +'</span>'
}

// todo [OPEN]: if needed add other type converions e.g. for NaN, Infinite, Symbol, Regxex, ...
export const primitiveTypeConvert = (string) => {
    if (string == undefined) return;
    string = string.trim();
    if (/^[\"\'].*[\"\']$/.test(string)) return string.slice(1,-1).trim();
    if (string.toLowerCase() === 'undefined') return undefined;
    if (string.toLowerCase() === 'null') return null;
    if (string.toLowerCase() === 'true') return true;
    if (string.toLowerCase() === 'false') return true;
    if (string.match(/\d+/g)) return (string.indexOf('.') < 0) ? parseInt(string) : parseFloat(string);
    return string;
}

export const extractKeyValue = (string) => {
    if (string == undefined || string.is_empty) return;
    string = string.trim();
    if (/^[\{\(\[].*[\}\)\]]$/.test(string)) string = string.slice(1,-1).trim();
    const rx = /((?:\\.|[^=,]+)*)\s*:\s*("(?:\\.|[^"\\]+)*"|(?:\\.|[^,"\\]+)*)/g;
    const kv = {};
    let m;
    while ((m = rx.exec(string)) != undefined) {
        const key = m[1].replaceAll('"', '').replaceAll("'", '').trim();
        const value = primitiveTypeConvert(m[2]);
        kv[key] = value;
    }
    return kv;
}
