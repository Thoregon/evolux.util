/**
 *  browser special functions
 */

export function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        try {
            const fileReader    = new FileReader();
            fileReader.onload = function (e) {resolve(e.target.result);}
            fileReader.readAsDataURL(blob);
        } catch (e) {
            reject(e);
        }
    });
}
