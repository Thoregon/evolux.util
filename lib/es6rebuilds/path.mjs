/**
 * transpiled 'path' module from nodeJS
 * wrapped to be used as ES6 module
 *
 * @author: blukassen
 */

const module = { exports: {} };

(function (f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f()
    } else if (typeof define === "function" && define.amd) {
        define([], f)
    } else {
        var g;
        if (typeof window !== "undefined") {
            g = window
        } else if (typeof global !== "undefined") {
            g = global
        } else if (typeof self !== "undefined") {
            g = self
        } else {
            g = this
        }
        g.path = f()
    }
})(function () {
    var define, module, exports;
    return (function e(t, n, r) {
        function s(o, u) {
            if (!n[o]) {
                if (!t[o]) {
                    var a = typeof require == "function" && require;
                    if (!u && a) return a(o, !0);
                    if (i) return i(o, !0);
                    var f = new Error("Cannot find module '" + o + "'");
                    throw f.code = "MODULE_NOT_FOUND", f
                }
                var l = n[o] = {exports: {}};
                t[o][0].call(l.exports, function (e) {
                    var n = t[o][1][e];
                    return s(n ? n : e)
                }, l, l.exports, e, t, n, r)
            }
            return n[o].exports
        }

        var i = typeof require == "function" && require;
        for (var o = 0; o < r.length; o++) s(r[o]);
        return s
    })({
        1: [function (require, module, exports) {
            (function (process) {
                var path = function () {
                    function e() {
                    }

                    return e.normalize = function (t) {
                        "" === t && (t = ".");
                        var r = t.charAt(0) === e.sep;
                        t = e._removeDuplicateSeps(t);
                        for (var n = t.split(e.sep), s = [], p = 0; p < n.length; p++) {
                            var a = n[p];
                            "." !== a && (".." === a && (r || !r && s.length > 0 && ".." !== s[0]) ? s.pop() : s.push(a))
                        }
                        if (!r && s.length < 2) switch (s.length) {
                            case 1:
                                "" === s[0] && s.unshift(".");
                                break;
                            default:
                                s.push(".")
                        }
                        return t = s.join(e.sep), r && t.charAt(0) !== e.sep && (t = e.sep + t), t
                    }, e.join = function () {
                        for (var t = [], r = 0; r < arguments.length; r++) t[r - 0] = arguments[r];
                        for (var n = [], s = 0; s < t.length; s++) {
                            var p = t[s];
                            if ("string" != typeof p) throw new TypeError("Invalid argument type to path.join: " + typeof p);
                            "" !== p && n.push(p)
                        }
                        return e.normalize(n.join(e.sep))
                    }, e.resolve = function () {
                        for (var t = [], r = 0; r < arguments.length; r++) t[r - 0] = arguments[r];
                        for (var n = [], s = 0; s < t.length; s++) {
                            var p = t[s];
                            if ("string" != typeof p) throw new TypeError("Invalid argument type to path.join: " + typeof p);
                            "" !== p && (p.charAt(0) === e.sep && (n = []), n.push(p))
                        }
                        var a = e.normalize(n.join(e.sep));
                        if (a.length > 1 && a.charAt(a.length - 1) === e.sep) return a.substr(0, a.length - 1);
                        if (a.charAt(0) !== e.sep) {
                            "." !== a.charAt(0) || 1 !== a.length && a.charAt(1) !== e.sep || (a = 1 === a.length ? "" : a.substr(2));
                            var i = process.cwd();
                            a = "" !== a ? this.normalize(i + ("/" !== i ? e.sep : "") + a) : i
                        }
                        return a
                    }, e.relative = function (t, r) {
                        var n;
                        t = e.resolve(t), r = e.resolve(r);
                        var s = t.split(e.sep), p = r.split(e.sep);
                        p.shift(), s.shift();
                        var a = 0, i = [];
                        for (n = 0; n < s.length; n++) {
                            var l = s[n];
                            if (l !== p[n]) {
                                a = s.length - n;
                                break
                            }
                        }
                        i = p.slice(n), 1 === s.length && "" === s[0] && (a = 0), a > s.length && (a = s.length);
                        var h = "";
                        for (n = 0; a > n; n++) h += "../";
                        return h += i.join(e.sep), h.length > 1 && h.charAt(h.length - 1) === e.sep && (h = h.substr(0, h.length - 1)), h
                    }, e.dirname = function (t) {
                        t = e._removeDuplicateSeps(t);
                        var r = t.charAt(0) === e.sep, n = t.split(e.sep);
                        return "" === n.pop() && n.length > 0 && n.pop(), n.length > 1 || 1 === n.length && !r ? n.join(e.sep) : r ? e.sep : "."
                    }, e.basename = function (t, r) {
                        if (void 0 === r && (r = ""), "" === t) return t;
                        t = e.normalize(t);
                        var n = t.split(e.sep), s = n[n.length - 1];
                        if ("" === s && n.length > 1) return n[n.length - 2];
                        if (r.length > 0) {
                            var p = s.substr(s.length - r.length);
                            if (p === r) return s.substr(0, s.length - r.length)
                        }
                        return s
                    }, e.extname = function (t) {
                        t = e.normalize(t);
                        var r = t.split(e.sep);
                        if (t = r.pop(), "" === t && r.length > 0 && (t = r.pop()), ".." === t) return "";
                        var n = t.lastIndexOf(".");
                        return -1 === n || 0 === n ? "" : t.substr(n)
                    }, e.isAbsolute = function (t) {
                        return t.length > 0 && t.charAt(0) === e.sep
                    }, e._makeLong = function (e) {
                        return e
                    }, e._removeDuplicateSeps = function (e) {
                        return e = e.replace(this._replaceRegex, this.sep)
                    }, e.sep = "/", e._replaceRegex = new RegExp("//+", "g"), e.delimiter = ":", e
                }();
                module.exports = path;

            }).call(this, require('_process'))
        }, {"_process": undefined}]
    }, {}, [1])(1)
});

export default module.exports;
