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

//
// routes
//

export const parseRoute = (url) => {
    let route = url.startsWith('#') ? url.substring(1) : url;
    let i = route.indexOf('?');
    if (i > -1) route = route.substring(0,i);
    // analyze route
    let path = route.split('/').filter((item) => item != '');
    return path;
}

export const parseUrlRoute = (url) => {
    let route = url.startsWith('#') ? url.substring(1) : url;
    let params = {};

    let i = route.indexOf('?');
    if (i > -1) {
        // extract params
        let paramstring = route.substring(i+1);
        route = route.substring(0, i);
        params = extractKeyValue(`{${paramstring}}`);
    }
    let path = route.split('/');
    return { path, params };
}

export const parseRouteIds = (url) => {
    let parts = Array.isArray(url) ? url : parseRoute(url);
    const ids = [];
    parts.forEach((part) => {
        if (!part.startsWith('{')) return;
        ids.push(part.slice(1,-1));
    });
    return ids;
}

export const matchRoute = (routespec, url) => {
}

//
// I18N
//

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

function splitSubToken(token) {
    const i = token.indexOf('.');
    if (i < 0) return { token, subkey: undefined };
    const subkey = token.substring(i+1);
    token = token.substring(0, i);
    return { token, subkey };
}

export const parseI18Nsimple = (template) => {
    template = template.trim();
    // first split th i18n string into its building blocks
    //  - token.subkey, divided by '.'
    //  - default text, separated by '|'

    // extract default text if any
    let token, subkey, defaultText;
    let i = template.lastIndexOf('|');
    if (i > -1) {
        defaultText = template.substring(i + 1);
        template    = template.substring(0, i);
    }
    token = template.trim();
    i     = template.indexOf('.');
    if (i > -1) {
        subkey = template.substring(i + 1);
        token  = template.substring(0, i);
    }
    return { token, subkey, defaultText };
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
    if (string.toLowerCase() === 'false') return false;
    if (string.match(/^[\d]+$/g)) return parseInt(string);
    if (string.match(/^[\d\.]+$/g)) return parseFloat(string);
    return string;
}

// parses not JSON! parses kv pairs with single quotes only like:
//  - 'key': 'value'
//  - key: 'value'
//  - key: value  (value must be a primitive type)
// todo [REFACTOR]: replace this very primitive parsing replace that with a more versatile
export const parseKeyValue = (string) => {
    if (string == undefined || string.is_empty) return;
    string = string.trim();
    if (/^[\{\(\[].*[\}\)\]]$/.test(string)) string = string.slice(1,-1).trim();
    const kv = {};
    let i = 0;
    let j = string.indexOf(':');
    while (j > -1) {
        let key = string.substring(i,j).trim();
        let val;
        if (key.startsWith("'") && key.endsWith("'")) key = key.slice(1,-1).trim();
        let m = string.indexOf("'", j);
        if (m < 0) m = string.length;
        i = string.indexOf(',', j);
        if (i < 0) i = string.length;
        if (m < i) {
            j = m;
            m = string.indexOf("'", j+1)+1;
            val = string.substring(j, m);
            i = string.indexOf(',', m);
            if (i < 0) i = string.length - 1;// else i++;
        } else {
            val = string.substring(j+1, i).trim();
        }
        i++;
        val = primitiveTypeConvert(val);
        kv[key] = val;
        j = string.indexOf(':', i);
    }

    return kv;
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

//
// lines parser
//

export function prevLine(source, l) {
    const j = source.lastIndexOf('\n', l);
    if (j < 0) return;
    const i = source.lastIndexOf('\n', j-1);
    return { line: source.substring(i+1, j), pos: i };
}

export function nextLine(source, l) {
    const j = source.indexOf('\n', l);
    if (j < 0) return;
    const i = source.indexOf('\n', j+1);
    return { line: source.substring(j+1, i), pos: i };
}


//
// annotations parser
// todo [REFACTOR]: replace this primitive parsers with proper js parsers to get better reliablity
//

export function parsePrefixClassAnnotations(source) {
    const classDeclarationRegex = /class.+{/;
    const classMatches = source.match(classDeclarationRegex);

    if (classMatches) {
        const classStartIndex = classMatches.index;
        const annotationsSource = source.substring(0, classStartIndex);
        const annotationRegex = /"@([^\s(]+)(?:\(([^)]*)\))?"/g;
        const matches = annotationsSource.matchAll(annotationRegex);
        const annotations = [];

        for (const match of matches) {
            const annotation = match[1];
            const parameters = match[2]; // don't split here: match[2] ? match[2].split(',') : [];
            annotations.push({ annotation, parameters });
        }

        return annotations;
    } else {
        return [];
    }
}

export function removeComments(source) {
    return source.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
}

export function extractMethodsSource(classsource) {
    try {
        const source = removeComments(classsource);
        const classRegex = /class\s+\w+\s*{/;
        const match = source.match(classRegex);
        if (!match) {
            return null;
        }

        const startIndex = match.index + match[0].length - 1;
        let braceCount = 1;
        let endIndex = startIndex + 1;

        while (braceCount > 0 && endIndex < source.length) {
            if (source[endIndex] === '{') {
                braceCount++;
            } else if (source[endIndex] === '}') {
                braceCount--;
            }
            endIndex++;
        }

        if (braceCount !== 0) {
            return null;
        }

        const classBody = source.slice(startIndex + 1, endIndex - 1).trim();
        return classBody;
    } catch (e) {
        console.error(e);
    }
    return null;
}


export function extractMethodsSource_old(classSource) {
    const classRegex = new RegExp(`class\\s+${className}\\s*{([^}]*)}`, 's');

    const methodBlocks = [];

    let depth = 0;
    let methodStart = -1;
    let clsidx = classSource.indexOf("class ");

    if (clsidx === -1) return "";
    let i = classSource.indexOf('{', clsidx);
    if (i === -1) return "";

    for (let i = clsidx; i < classSource.length; i++) {
        if (classSource[i] === '{') {
            depth++;
            if (depth === 1) {
                methodStart = i + 1;
            }
        } else if (classSource[i] === '}') {
            depth--;
            if (depth === 0 && methodStart !== -1) {
                methodBlocks.push(classSource.substring(methodStart, i));
                methodStart = -1;
            }
        }
    }

    return methodBlocks.pop();
}

export function parseMethodAnnotations(source) {
    const extractMethods     = /("@.*?(?:\s+(\w+)\s*\(|=>\s*{\s*(\w+)\s*{))/gs;
    const extractAnnotations = /"@((\w+)(\([^)]*\))?)"/g;
    const methods            = {};
    let   srcmatch, annomatch;

    while (srcmatch = extractMethods.exec(source)) {
        const mthsource  = srcmatch[1];
        const methodName    = srcmatch[2];

        while (annomatch = extractAnnotations.exec(mthsource)) {
            const annotation = annomatch[2];
            const parameters = (annomatch[3] || '').replace(/^[({\s]+|[)}\s]+$/g, ''); // Remove surrounding brackets and spaces;
            let annotations = methods[methodName];
            if (!annotations) annotations = methods[methodName] = [];
            annotations.push({ annotation, parameters });
        }
    }

    return methods;
}

// ==============================================================

export function findPrefixMethodAnnotations(source, methodName) {
    const methodRegex = new RegExp(
        `\\s*${methodName}\\s*\\([^)]*\\)\\s*{([\\s\\S]*?@\\w+[^}]*?)}\\s*`,
        'g'
    );

    const methodMatch = methodRegex.exec(source);

    if (methodMatch) {
        const annotationsText = methodMatch[1];
        const annotationRegex = /@(\w+)/g;
        const annotations = [];

        let annotationMatch;
        while ((annotationMatch = annotationRegex.exec(annotationsText))) {
            const annotationName = annotationMatch[1];
            annotations.push(annotationName);
        }

        return annotations;
    }

    return [];
}

export function findAnnotations(source, identifier, searchfn) {
    const i = source.indexOf(identifier);
    if (i < 0) return [];
    const annotations = [];
    let { line, pos } = searchfn(source, i);
    let prev;
    while (line) {
        line = line.trim();
        if (line.startsWith('//@') || line.startsWith('/*@')) {
            line = line.substring(2);
            if (line.endsWith('*/')) prev = line.slice(0,-2);
            annotations.unshift(line);
        }
        if (line.startsWith('"@')) {
            line = line.slice(1,-1);
            annotations.unshift(line);
        }
        let res = searchfn(source, pos);
        if (res) {
            line = res.line;
            pos = res.pos
            if (line) {
                line = line.trim();
                if (line === '' || line === '}') line = undefined;
            }
        }
    }
    return annotations;
}

export function findPrefixFnAnnotations(source, name) {
    return findAnnotations(source, `${name}(`, prevLine);
}

export function findPostfixFnAnnotations(source, name) {
    return findAnnotations(source, `${name}(`, nextLine);
}

export function findPrefixClassAnnotations(source, name) {
    return findAnnotations(source, `class ${name}`, prevLine);
}

export function findPostfixClassAnnotations(source, name) {
    return findAnnotations(source, `class ${name}`, nextLine);
}

export function parseAnnotation(annotationstr) {
    const rx = /@([a-z,A-Z,0-9,$,_]*)(?:\((.*)\))?/g;
    const match = rx.exec(annotationstr);
    if (!match) return;
    const an = { annotation: match['1'] };
    if (match.length > 2) {
        const params = match['2'];
        if (params.startsWith('{')) {
            an.params = extractKeyValue(params);
        } else {
            an.params = { default: params};
        }
    }
    return an;
}

export function findImport(source, name) {
    const rx = new RegExp(`.*?import.*?${name}.*?from\W"(.*?)\"`, "s");
    const match = rx.exec(source);
    if (!match) return;
    const url = match['1'];
    return { name, url };
}

export function findExtends(source, clsname) {
    const rx = new RegExp(`.*class${clsname ?? '.*'}extends(.*)\{`, "gm");
    const match = rx.exec(source);
    if (!match) return;
    const ext = match['1'];
    return ext;
}

export function extractSuper(ext, spr) {
    if (ext.indexOf('(') < 0) return [ext];
    const rx = /(\w)\((.*)\)/;
    const match = rx.exec(ext);
    return [ match['1'], ...extractSuper(match['2'])];
}

export function extractClassSource(src, name) {
    const i = src.indexOf(`class ${name}`);
    if (i < 0) return;
    let s = src.lastIndexOf('}', i)+1;
    let e    = src.indexOf('{', i);
    let open = 1;
    while ((e++) < src.length && open > 0) {
        if (src.charAt(e) === '{') open++;
        if (src.charAt(e) === '}') open--;
    }
    return src.substring(s, e);
}
