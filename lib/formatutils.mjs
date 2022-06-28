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

export const parseTplString = (template) => {
    let fns = [];
    let i = 0;
    let definition = template.replace(/\${([^}]+)}/g, (def, js) => {
        fns.push(js);
        return `@[${i++}]`;
    });
    return { definition, fns };
}

export const replaceTplString = (template, params) => {
    let i = 0;
    let result = template.replace(/@\[.+?\]/g, () => params[i++]);
    return result;
}

const RX_I18N_FULL         = /(.+)\((.+)\)?\|(.+)?/;
const RX_I18N_REPLACEMENTS = /(.+)\((.+)\)?/;
const RX_I18N_DEFAULT      = /(.+)\|(.+)?/;

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
        const i18nAttribute = match[1];
        const { token, subkey } = splitSubToken(match[1]);   // first match is the token
        const replacements           = match[2];   // second match are the replacements
        const defaultText     = match[3];   // third match is the default
        return { defaultText, i18nAttribute, token, subkey, replacements };  // i18nSpan     : '<span aurora-i18n="'+ i18nAttribute +'">'+ defaultText +'</span>'
    }

    // test I18N w/o default but with replacements
    match = template.match(RX_I18N_REPLACEMENTS);
    if (match) {
        const i18nAttribute     = match[1];
        const { token, subkey } = splitSubToken(match[1]);   // first match is the token
        const replacements           = match[2];   // second match are the replacements
        return { i18nAttribute, token, subkey, replacements, defaultText: undefined };  // i18nSpan     : '<span aurora-i18n="'+ i18nAttribute +'">'+ defaultText +'</span>'
    }

    // test I18N w/o replacements but with default
    match = template.match(RX_I18N_DEFAULT);
    if (match) {
        const i18nAttribute     = match[1];
        const { token, subkey } = splitSubToken(match[1]);   // first match is the token
        const defaultString     = match[2];   // second match is the default
        return { defaultText, i18nAttribute, token, subkey, replacements: undefined };  // i18nSpan     : '<span aurora-i18n="'+ i18nAttribute +'">'+ defaultText +'</span>'
    }

    const i18nAttribute = template;
    const { token, subkey } = splitSubToken(template);
    return { i18nAttribute, token, subkey, defaultText: undefined, replacements: undefined };  // i18nSpan     : '<span aurora-i18n="'+ i18nAttribute +'">'+ defaultText +'</span>'
}
