
/**
 * debounces a function by collecting all parameters within a specified repeat wait time
 *
 * @author: blukassen
 */

const optmillis = 250;

export const debounce = (fn, millis) => {

    const fndebounce = ((_fn, _millis) => {
        let slot = {
            targetfn: _fn,
            wait: _millis || optmillis,
            pending: null,
            params: []
        };

        return function (...args) {
            check(slot, args)
        }
    })(fn, millis);

    return fndebounce;
};

const check = (slot, args) => {
    if (slot.pending) clearTimeout(slot.pending);
    slot.params.push(args);

    slot.pending = setTimeout(function() {
        let params = slot.params;
        slot.params = [];
        slot.targetfn(params);
    }, slot.wait);
};
