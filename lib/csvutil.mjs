/**
 * very simple CSV parsing w/o dependencies.
 * may not parse every CSV!
 *
 * since there is no common agreed specification of CSV, some common characteristics have emerged
 * - fields are delimited by colon, or another specified delimiter
 * - field values may be in quotes (" - double quote!) to allow the delimiter in the field value
 * - field values, if in quotes, may contain newlines
 * - consecutive double quotes within a field value are escaped to a single double quote
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

export const CSVDELIMITER = ',';
export const CSVFIELDDELIMITER = '"';
export const CSVLINEDELIMITER = '\n';

export const parseCSVline = (line, delimiter = CSVDELIMITER) => {
    const parts  = line.split(delimiter);
    const colums = [];
    for (let i = 0; i < parts.length; i++) {
        let part = parts[i];
        if (part.startsWith(CSVFIELDDELIMITER)) {
            if (part.endsWith(CSVFIELDDELIMITER)) {
                part = part.substring(1, part.length - 1);
            } else {
                part = part.substring(1);
                let part2 = parts[++i];
                while (i < parts.length && !part2.endsWith(CSVFIELDDELIMITER)) { // just add parts until the closing quote is found
                    part += delimiter + part2;
                    part2 = parts[++i];
                }
                part += delimiter + part2.substring(0, part2.length - 1);
            }
        }
        colums.push(part.replaceAll('""', '"'));
    }
    return colums;
}

export const parseCSV = (csv, { delimiter = CSVDELIMITER, skipfirst = false } = {} ) => {
    const parts = csv.split(CSVLINEDELIMITER);
    const lines = [];
    for (let i = 0; i < parts.length; i++) {
        let part = parts[i];
        if (((part.match(/"/g) || []).length) % 2 > 0) {
            // there is a quoted field containing a 'newline', collect lines
            let part2 = parts[++i];
            while (((part2.match(/"/g) || []).length) === 0) {   // add until there is a line containing the closing quote. todo: does not work if there are multiple fields with newlines
                part += CSVLINEDELIMITER + part2;
                part2 = parts[++i];
            }
            part += CSVLINEDELIMITER + part2;
        }
        if (part.trim()) lines.push(part);  // skip empty lines
    }

    const table = [];
    for (let i = skipfirst ? 1 : 0; i < lines.length; i++) {
        const line = lines[i];
        table.push(parseCSVline(line, delimiter));
    }

    return table;
}
