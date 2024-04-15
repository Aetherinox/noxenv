const bIsWindows = require('../windows');

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

test(`Return true if platform is Windows`, () => {
    process.platform = 'win32';
    expect(bIsWindows()).toBe(true);
});

test(`Return false if platform is not Windows`, () => {
    process.platform = 'linux';
    expect(bIsWindows()).toBe(false);
});

test(`Return true if type is cygwin or msys`, () => {
    process.platform = 'linux';

    process.env.OSTYPE = 'cygwin';
    expect(bIsWindows()).toBe(true);

    process.env.OSTYPE = 'msys';
    expect(bIsWindows()).toBe(true);

    process.env.OSTYPE = '';
    expect(bIsWindows()).toBe(false);
});
