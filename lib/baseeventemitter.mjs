/**
 *
 *
 * @author: blukassen
 */

export default class BaseEventEmitter {

    constructor() {
        this._listeners = {};
    }

    //**** rebuild original EventEmitter API to make

    on(eventname, listener) {
        let listeners = this._listeners[eventname];
        if (!listeners) listeners = this._listeners[eventname] = [];
        listeners.push(listener);
        return this;
    }

    addEventListener(eventname, listener) {
        return this.addListener(eventname, listener);
    }

    addListener(eventname, listener) {
        return this.on(eventname, listener);
    }


    off(eventname, listener) {
        let listeners = this._listeners[eventname];
        if (!listeners) return;
        this._listeners[eventname] = listeners.filter((fn) => fn !== listener);
        return this;
    }


    removeListener(eventname, listener) {
        return this.off(eventname, listener);
    }

    removeAllListeners(eventname) {
        delete this._listeners[eventname];
        return this;
    }

    emit(eventname, payload) {
        let listeners = this._listeners[eventname];
        if (!listeners) return;
        const event = { event: eventname, payload };   // each listener get's it's own event object to avoid side effects
        for (const listener of listeners) {
            const event = { event: eventname, payload };   // each listener get's it's own event object to avoid side effects
            try {
                listener(event);
            } catch (e) {
                console.log("Dispatch event", event, e);
            }
        }
    }

    //**** add pub/sub API; only for topics, queues require a prior agreement
    subscribe(topic, listener) {
        this.on(topic, listener);
        return this;
    }

    publish(topic, payload) {
        this.emit((topic, payload));
        return this;
    }

    //**** implement by subclasses

    /**
     * which events will be published by this emitter
     * @return {Map<String,String> } published events - with the event name as key, and a description describing the event and the payload
     */
    get publishes() {
        return [];
        // throw ErrNotImplemented("EventEmitter.publishes()");
    }

    /**
     * event names only
     * @return {string[]}
     */
    eventNames() {
        return [];
//        const events = this.publishes;
//        return Object.keys(events);
    }
}
