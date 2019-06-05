/**
 *
 *
 * @author: blukassen
 */

const { toHex, isClass, className } = require('../../index');

test("HEX1", () => {
    let num = 255;
    expect(toHex(num)).toBe("FF");
});

test("Classname String", () => {
    expect(className("A")).toBe("String");
});

test("Classname Number", () => {
    expect(className(1)).toBe("Number");
});

test("Classname Object", () => {
    expect(className({ a: "A" })).toBe("Object");
});

test("Classname Array", () => {
    expect(className(["A"])).toBe("Array");
});

test("is not Class", () => {
    expect(isClass({})).toBe(false);
});

test("is Class", () => {
    class X {};
    expect(isClass(X)).toBe(true);
});

/*
test("caller dir", () => {
   let info = getCallerDir();
   expect(info[0]).toBe("/Entw/Projects/ThoregonUniverse/evolux.modules/evolux.util/test/spec");
   expect(info[1]).toBe("util.test.js");
});
*/
