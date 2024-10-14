/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import pako from "./pako.esm.mjs";

// Helper function to convert a string to Uint8Array
export function stringToUint8Array(str) {
    return new TextEncoder().encode(str);
}

// Helper function to convert Uint8Array to a string
export function uint8ArrayToString(uint8Array) {
    return new TextDecoder().decode(uint8Array);
}

// Function to encode an object to DataView
export function encodeObjectToDataView(obj) {
    // Calculate the total length needed for the DataView
    let totalLength = 0;
    for (let key in obj) {
        const keyLength = key.length;
        const valueLength = obj[key].length;
        totalLength += 1 + keyLength + 4 + valueLength;
    }

    if (isNaN(totalLength)) throw Error("Object can't be encoded");

    console.log("totalLength", totalLength);

    const buffer = new ArrayBuffer(totalLength);
    const dataView = new DataView(buffer);
    let offset = 0;

    for (let key in obj) {
        const keyArray = stringToUint8Array(key);
        const valueArray = obj[key];
        console.log("offset", offset, "->", key, valueArray.length);
        dataView.setUint8(offset, keyArray.length);
        offset += 1;
        for (let i = 0; i < keyArray.length; i++) {
            dataView.setUint8(offset, keyArray[i]);
            offset += 1;
        }
        dataView.setUint32(offset, valueArray.length, true);
        offset += 4;
        for (let i = 0; i < valueArray.length; i++) {
            dataView.setUint8(offset, valueArray[i]);
            offset += 1;
        }
    }

    return dataView;
}

// Function to decode a DataView back to an object
export function decodeDataViewToObject(dataView) {
    const obj = {};
    let offset = 0;

    while (offset < dataView.byteLength) {
        const keyLength = dataView.getUint8(offset);
        offset += 1;
        const keyArray = new Uint8Array(keyLength);
        for (let i = 0; i < keyLength; i++) {
            keyArray[i] = dataView.getUint8(offset);
            offset += 1;
        }
        const key = uint8ArrayToString(keyArray);
        const valueLength = dataView.getUint32(offset, true);
        offset += 4;
        const valueArray = new Uint8Array(valueLength);
        for (let i = 0; i < valueLength; i++) {
            valueArray[i] = dataView.getUint8(offset);
            offset += 1;
        }
        obj[key] = valueArray;
    }

    return obj;
}

// Function to gzip a DataView
export function gzipDataView(dataView) {
    const uint8Array = new Uint8Array(dataView.buffer);
    return pako.gzip(uint8Array);
}

// Function to gunzip back to a DataView
export function gunzipToDataView(gzippedUint8Array) {
    const uint8Array = pako.ungzip(gzippedUint8Array);
    return new DataView(uint8Array.buffer);
}

/*
// Example usage
const exampleObject = {
    property1: new Uint8Array([1, 2, 3]),
    property2: new Uint8Array([4, 5, 6, 7])
};

const encodedDataView = encodeObjectToDataView(exampleObject);
const gzippedDataView = gzipDataView(encodedDataView);
const ungzippedDataView = gunzipToDataView(gzippedDataView);
const decodedObject = decodeDataViewToObject(ungzippedDataView);

console.log(decodedObject);
*/
