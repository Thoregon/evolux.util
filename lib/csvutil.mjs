/**
 *
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
                while (i < parts.length && !part2.endsWith(CSVFIELDDELIMITER)) {
                    part += delimiter + part2;
                    part2 = parts[++i];
                }
                part += delimiter + part2.substring(0, part2.length - 1);
            }
        }
        colums.push(part);
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
            while (((part2.match(/"/g) || []).length) === 0) {   // add until there is a line containing the closing quote
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
