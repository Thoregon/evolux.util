/**
 *
 *
 * @author: Bernhard Lukassen
 */

const RepoMirror = (classbase, mirrorbase) => class RepoMirror extends classbase {

    // mirror on schemas
    _addToMirror(id, schema, obj) {
        let parts = id.split('.');
        if (!obj) obj = this._mirror();
        let key = parts[0];
        if (parts.length > 1) {
            let next = obj[key];
            if (!next) {
                next = {};
                obj[key] = next;
                next = obj[key];    // don't remove! this retrieves the 'AccessObserver' proxy
            }
            parts.splice(0,1);
            this._addToMirror(parts.join('.'), schema, next);
        } else {
            try {
                obj[key] = schema;
            } catch (e) {
                universe.logger.error(`[RepoMirror] can't set property, object is locked (maybe it's a Module, rename component. '${id}'`, e);
            }
        }
    }

    _removeFromMirror(id, obj) {
        let parts = id.split('.');
        if (parts.length < 1) return;
        let key = parts[0];
        if (!obj) obj = this._mirror();
        if (parts.length > 1) {
            let next = obj[key];
            parts.splice(0,1);
            this._removeFromMirror(parts.join('.'), next);
        } else {
            delete obj[key];
        }
    }

    _mirror() {
        if (!universe[mirrorbase]) universe[mirrorbase] = {};
        return universe[mirrorbase];
    }
};

export default RepoMirror;
