/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */
import { aretry, forEach } from "./utilfns.mjs";

export default (base) => class AsyncResource extends (base || Object) {

    constructor({
                    id
                } = {}) {
        super();
        this._Q = { queue: undefined, result: undefined };
    }

    _establishResource(fn) {
        return new Promise(async (resolve, reject) => {
            if (this._Q.result !== undefined) {
                resolve(this._Q.result);
            } else if (!this._Q.queue) {
                let queue = [];
                queue.push({ resolve, reject});
                this._Q.queue = queue;
                try {
                    let res = await reqfn();
                    await forEach(queue, async (qreq) => await qreq.resolve(res));
                } catch (e) {
                    await forEach(queue, async (qreq) => await qreq.reject(e));
                }
            } else {
                this._Q.queue.push({ resolve, reject});
            }
        });
    }
}
