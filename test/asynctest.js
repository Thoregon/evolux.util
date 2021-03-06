/**
 *
 *
 * @author: blukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));

import { atimeout, aretry } from '../lib/utilfns.mjs';

let s = 6;

try {
    await atimeout(() => {}, 1000);
    s--;
    console.log('1 +', 'no timeout');
} catch (e) {
    console.log('1 -', e ? e.message : 'timeout');
}

try {
    await atimeout(async () => { await timeout(1000) }, 500);
    console.log('2 -', 'no timeout');
} catch (e) {
    s--;
    console.log('2 +', e ? e.message : 'timeout');
}

try {
    await aretry(() => {}, { retries: 5, interval: 500 });
    s--;
    console.log('3 +', 'no retries');
} catch (e) {
    console.log('3 -', e ? e.message : 'more retries');
}

try {
    let i = 3;
    await aretry(() => {return new Promise(resolve => { if (i-- < 1) resolve() })}, { retries: 5, interval: 500 });
    s--;
    console.log('4 +', '3 retries');
} catch (e) {
    console.log('4 -', e ? e.message : 'more retries');
}

try {
    let i = 7;
    await aretry(() => {return new Promise(resolve => { if (i-- < 1) resolve() })}, { retries: 5, interval: 500 });
    console.log('5 -', '7 retries');
} catch (e) {
    s--;
    console.log('5 +', e ? e.message : 'out of retries');
}

try {
    let i = 3;
    await aretry(() => {
        return new Promise(async (resolve) => {
            await timeout(200);
            resolve();
            // if (i-- < 1) resolve();
        })
    }, { retries: 5, interval: 500 });
    s--;
    console.log('6 +', '3 retries with await');
} catch (e) {
    console.log('6 -', e ? e.message : 'more retries with await');
}


console.log(s !== 0 ? `*** Tests failed: ${s}` : '>>> all tests passed');
