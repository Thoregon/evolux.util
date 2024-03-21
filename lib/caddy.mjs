/**
 * base built with ChatGPT with manual fixes (applied laziness)
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

export function parseCaddyfile(caddyfileContent) {
    // Split the input into lines and initialize variables
    const lines = caddyfileContent.split(/\r?\n/);
    const result = {};
    let currentBlock = result;
    const blockStack = [];

    lines.forEach(line => {
        const trimmedLine = line.trim();

        // Skip empty lines and comments
        if (trimmedLine === '' || trimmedLine.startsWith('#')) {
            return;
        }

        // Handle block start
        if (trimmedLine.endsWith('{')) {
            const blockName = trimmedLine.slice(0, -1).trim() || '*';
            const newBlock = {};
            // If block name contains spaces, it's a directive with values before the block starts
            if (blockName.includes(' ')) {
                const parts = blockName.split(/\s+/);
                const directive = parts.shift();
                currentBlock[directive] = currentBlock[directive] || [];
                currentBlock[directive].push({ _values: parts, ...newBlock });
                blockStack.push(currentBlock);
                currentBlock = newBlock;
            } else {
                currentBlock[blockName] = newBlock;
                blockStack.push(currentBlock);
                currentBlock = newBlock;
            }
            // Handle block end
        } else if (trimmedLine === '}') {
            currentBlock = blockStack.pop();
        } else {
            // Handle directives and values within a block
            const [directive, ...values] = trimmedLine.split(/\s+/);
            if (!currentBlock[directive]) {
                currentBlock[directive] = [];
            }
            if (values.length > 0) currentBlock[directive].push(values.length > 1 ? values : values[0]);
        }
    });

    return result;
}

export function printCaddyfile(structuredObject, indent = 0) {
    let caddyfileContent = '';
    const indentation = '    '.repeat(indent);

    Object.entries(structuredObject).forEach(([key, value]) => {
        if (key === '*') key = '';  // default block
        if (Array.isArray(value)) {
            value.forEach(item => {
                if (typeof item === 'object' && item._values) {
                    // Handle directives with values that lead to a block
                    caddyfileContent += `${indentation}${key} ${item._values.join(' ')} {\n`;
                    caddyfileContent += printCaddyfile(item, indent + 2);
                    caddyfileContent += `${indentation}}\n`;
                } else {
                    // Handle simple directive with values
                    const valuesString = Array.isArray(item) ? item.join(' ') : item;
                    caddyfileContent += `${indentation}${key} ${valuesString}\n`;
                }
            });
            if (value.length === 0) caddyfileContent += `${indentation}${key}\n`;
        } else if (typeof value === 'object') {
            // Handle nested blocks
            caddyfileContent += `${indentation}${key} {\n`;
            caddyfileContent += printCaddyfile(value, indent + 2);
            caddyfileContent += `${indentation}}\n\n`;
        } else {
            // Handle simple directives without specific values
            caddyfileContent += `${indentation}${key}\n\n`;
        }
    });

    return caddyfileContent;
}
