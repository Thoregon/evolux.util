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

export const extractJSFunctions = (template, i = 0) => {
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
    template = template.trim();
    const i18nAttribute = template;
    // first split th i18n string into its building blocks
    //  - token.subkey, divided by '.'
    //  - replacements, embraced with '()' brackets
    //  - default text, separated by '|'

    // extract default text if any
    let defaultText;
    let i = template.lastIndexOf('|');
    if (i > -1) {
        defaultText = template.substring(i+1);
        template = template.substring(0, i);
    }
    template = template.trim();

    // extract replacements if any
    let sreplacements;
    if (template.endsWith(')')) {
        i = template.indexOf('(');
        sreplacements = `{${template.slice(i+1, -1)}}`;
        template = template.substring(0,i);
    }

    // get token and subkey
    let keys = splitSubToken(template);

    // extract JS functions
    i=0;
    const { definition: token, fns: tfns }        = extractJSFunctions(keys.token, i);
    const { definition: subkey, fns: sfns }       = extractJSFunctions(keys.subkey, i);
    const { definition: replacements, fns: rfns } = extractJSFunctions(sreplacements, i);   // second match are the replacements

    const i18n = { defaultText, i18nAttribute, token, subkey, replacements, fns: [...tfns, ...sfns, ...rfns] };  // i18nSpan     : '<span aurora-i18n="'+ i18nAttribute +'">'+ defaultText +'</span>'
    return i18n;
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
