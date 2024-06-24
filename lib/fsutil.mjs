/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import { isString } from "./objutils.mjs";

export const exists = async (path) => {
    const fs = universe.fs;    // get file system
    let stat;
    try {
        stat = await fs.stat(path);
        return true;
    } catch (ignore) {}
    return false;
}

export const isDir = async (path) => {
    const fs = universe.fs;    // get file system
    let stat;
    try {
        stat = await fs.stat(dir + '/' + filename);
        return stat?.isDirectory();
    } catch (ignore) {}
    return false;
}

export const isFile = async (path) => {
    const fs = universe.fs;    // get file system
    let stat;
    try {
        stat = await fs.stat(dir + '/' + filename);
        return stat?.isFile();
    } catch (ignore) {}
    return false;
}

export const ensureDir = async (path) => {
    if (exists(path) && !isDirectory(path)) throw Error('not a directory: ' + path);
    if (!exists(path)) {

    }
}

export const readFile = async (path, name) => {
    try {
        path = (name) ? universe.path.resolve(path, name) : universe.path.resolve(path);
        if (!isFile(path)) return;
        const data = await universe.fs.readFile(path, { encoding: 'utf8' });
        return data;
    } catch (e) {
        console.error(e);
        return;
    }
}

export const readFileJson = async (path, name) => {
    try {
        const json = await readFile(path, name);
        if (!json) return;
        const obj = JSON.parse(json);
        return obj;
    } catch (e) {
        console.error(e);
        return;
    }
}

export const writeFile = async (path, nameOrData, data) => {
    try {
        path = data ? universe.path.resolve(path, nameOrData) : universe.path.resolve(path);
        let json = data ?? nameOrData;
        if (!isString(json)) json = JSON.stringify(json);
        await fs.writeFile(path, json, 'utf8');
    } catch (e) {
        console.error(e);
        return;
    }
}