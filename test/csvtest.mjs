/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import { parseCSV } from "../lib/csvutil.mjs";

const csv = `A,B,C,D
a, "b
2","c
3
4","d5"
`;

const rows = parseCSV(csv);

console.log(csv);
