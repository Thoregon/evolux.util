/**
 *  node special functions
 */
function _arrayBufferToBase64(buf) {
    let binary = '';
    let bytes = new Uint8Array(buf);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
export async function blobToDataURL(blob) {
    const mimeType = blob.type;
    const buf = await blob.arrayBuffer();
    const b64 = _arrayBufferToBase64(buf);
    const dataUrl = `data:${mimeType};base64,${b64}`;
    return dataUrl;
}

