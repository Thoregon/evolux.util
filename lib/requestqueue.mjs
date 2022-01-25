/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

const reqqueue = {};

export default (reqid, reqfn) => {
    return new Promise(async (resolve, reject) => {
        let queue = reqqueue[reqid];
        if (!queue) {
            queue = [];
            reqqueue[reqid] = queue;
            queue.push( { resolve, reject });
            try {
                let res = await reqfn();
                for await (const qreq of queue) {
                    try { await qreq.resolve(res) } catch (ignore) { console.log(ignore) }
                }
            } catch (e) {
                for await (const qreq of queue) {
                    try { await qreq.reject(e) } catch (ignore) { console.log(ignore) }
                }
            }
            delete reqqueue[reqid];
        } else {
            queue.push( { resolve, reject });
        }
    });
}
