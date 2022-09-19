/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

export { serialize as $ser }   from './serialize.mjs';
export { deserialize as $des } from './serialize.mjs';

export const $ref = (ref) => `$ref|${ref}`;
export const $isRef = (ref) => ref?.startsWith?.('$ref') ?? false;
export const $deref = (ref) => $isRef(ref) ? ref.substring(5) : undefined;
