/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

export function insertBlanksAtBeginning(str, numBlanks, withFirst = true) {
    // Check if the input is a valid number
    if (typeof numBlanks !== 'number' || Number.isNaN(numBlanks) || numBlanks < 0) {
        throw new Error('Invalid input: Please provide a non-negative number');
    }
    const indent = ' '.repeat(numBlanks);

    // Split the string into an array of lines
    const lines = str.split('\n');

    // Prepend the specified number of blanks to each line
    const indentedLines = withFirst
                          ? lines.map(line => indent + line)
                          : [lines[0], ...lines.slice(1).map(line => indent + line)];

    // Join the indented lines back into a string with newlines
    return indentedLines.join('\n');
}

export const json = (obj) => obj ? JSON.stringify(obj) : '';

export function source(obj, { indent = 4, currentIndent = 0, excludes = [] } = {}) {
    const currentSpaces = ' '.repeat(currentIndent);
    const nextIndent = currentIndent + indent;

    if (Array.isArray(obj)) {
        let result = '[';
        if (obj.length > 0) {
            result += '\n';
            result += obj.map(item => currentSpaces + ' '.repeat(indent) + source(item, { indent, currentIndent: nextIndent, excludes })).join(',\n');
            result += '\n' + currentSpaces;
        }
        result += ']';
        return result;
    } else if (typeof obj === 'object' && obj !== null) {
        let result = '{';
        const keys = Object.keys(obj);
        if (keys.length > 0) {
            result += '\n';
            result += keys.filter(key => !excludes.includes(key) && obj[key] != undefined).map(key => currentSpaces + ' '.repeat(indent) + key + ': ' + (obj[key]?.asSource?.(indent) ?? source(obj[key], { indent, currentIndent: nextIndent, excludes }))).join(',\n');
            result += '\n' + currentSpaces;
        }
        result += '}';
        return result;
    } else if (typeof obj === 'string') {
        return `"${obj}"`;
    } else {
        return JSON.stringify(obj);
    }
}

/*
{
    // Check if the input is a valid object
    if (typeof obj !== 'object' || obj === null) {
        throw new Error('Invalid input: Please provide an object');
    }

    // Check if indent is a valid number
    if (typeof indent !== 'number' || Number.isNaN(indent) || indent < 0) {
        throw new Error('Invalid input: Indent must be a non-negative number');
    }

    // Function to create the indent string based on the indent level
    const createIndent = (level) => ' '.repeat(level * indent);

    // Function to handle values within the object
    function processValue(value, level) {
        if (typeof value === 'object') {
            if (Array.isArray(value)) { // Handle arrays
                return `[\n${value.asSource?.(indent) ?? source(value, { indent: level + 1, excludes })}\n${createIndent(level)}]`;
            } else { // Handle objects
                return `{\n${value.asSource?.(indent) ?? source(value, { indent: level + 1, excludes })}\n${createIndent(level)}}`;
            }
        } else {
            return String(value); // Convert other types to strings
        }
    }

    // Initialize empty string for output
    let str = '';

    // Iterate through each property-value pair of the object
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && !excludes.includes(key)) {
            str += `${createIndent(1)}${key}:${processValue(obj[key], 1)}\n`;
        }
    }

    // Remove trailing newline
    return str.slice(0, -1);
}



{
    // Check if the input is a valid object
    if (typeof obj !== 'object' || !Array.isArray(value) || obj === null) {
        throw new Error('Invalid input: Please provide an object or array');
    }

    // Check if indent is a valid number
    if (typeof indent !== 'number' || Number.isNaN(indent) || indent < 0) {
        throw new Error('Invalid input: Indent must be a non-negative number');
    }

    const openBrkt = Array.isArray(obj) ?

    // Function to create the indent string based on the indent level
    const createIndent = (level) => ' '.repeat(level * indent);

    // Initialize an empty string to store the output
    let str = '';

    // Iterate through each property-value pair in the object
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && !excludes.includes(key)) {
            const value = obj[key];

            // Convert the value to a string if it's an object or array
            const valueStr = (typeof value === 'object' || Array.isArray(value)) ?
                             (value.asSource?.(indent) ?? source(value, { indent: indent + 4, excludes })) : // Recursive call with increased indent
                             String(value);

            // Append the key-value pair and newline with indent
            str += `${createIndent(1)}${key}:${valueStr}\n`;
        }
    }

    // Remove the trailing newline
    return str.slice(0, -1);
}
*/
