const bIsDarwin = require('../darwin');

const {
    platform,
    env: { OSTYPE }
} = process;

/*
    make platform writable
*/

Object.defineProperty(process, 'platform', {
    value: platform,
    writable: true
});

afterEach(() => {
    process.platform = platform;
    process.env.OSTYPE = OSTYPE;
});

test(`Return true if platform is Darwin`, () => {
    process.platform = 'darwin';
    expect(bIsDarwin()).toBe(true);
});

test(`Return false if platform is not Darwin`, () => {
    process.platform = 'linux';
    expect(bIsDarwin()).toBe(false);
});
