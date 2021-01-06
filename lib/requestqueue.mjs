/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */
import { forEach } from "./utilfns.mjs";

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
                await forEach(queue, async (qreq) => await qreq.resolve(res));
            } catch (e) {
                await forEach(queue, async (qreq) => await qreq.reject(e));
            }
            delete reqqueue[reqid];
        } else {
            queue.push( { resolve, reject });
        }
    });
}
