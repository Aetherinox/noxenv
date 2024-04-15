const bIsWinMock = require('../windows');
const cmdConvert = require('../cmd');

jest.mock('../windows');

const env = {
    alpha: 'test value 1',
    bravo: 'test value 2',
    charlie: 'test value 3',
    delta: 'test value 4',
    echo_empty: ''
};

afterEach(() => {
    jest.clearAllMocks();
});

test(`Convert *nix-style env var usage for Windows`, () => {
    bIsWinMock.mockReturnValue(true);
    expect(cmdConvert('$alpha', env)).toBe('%alpha%');
});

test(`Leave command unchanged when not a var`, () => {
    expect(cmdConvert('alpha', env)).toBe('alpha');
});

test(`Doesn't convert Windows-style env var`, () => {
    bIsWinMock.mockReturnValue(false);
    expect(cmdConvert('%alpha%', env)).toBe('%alpha%');
});

/*
    Variable left unchanged if using correct OS
*/

test(`Variable unchanged when using correct OS platform`, () => {
    bIsWinMock.mockReturnValue(false);
    expect(cmdConvert('$alpha', env)).toBe('$alpha');
});

/*
    Prevents regexp traps such as:
    http://stackoverflow.com/a/1520853/971592
*/

test(`Check Stateless`, () => {
    bIsWinMock.mockReturnValue(true);
    expect(cmdConvert('$alpha', env)).toBe(cmdConvert('$alpha', env));
});

test(`Convert embedded *nix-style env for windows`, () => {
    bIsWinMock.mockReturnValue(true);
    expect(cmdConvert('$bravo/$charlie/$delta', env)).toBe('%bravo%/%charlie%/%delta%');
});

test(`Leave embedded env var unchanged when on correct OS platform`, () => {
    bIsWinMock.mockReturnValue(false);
    expect(cmdConvert('$bravo/$charlie/$delta', env)).toBe('$bravo/$charlie/$delta');
});

test(`Convert braced *nix-style env usage for Windows`, () => {
    bIsWinMock.mockReturnValue(true);
    // eslint-disable-next-line no-template-curly-in-string
    expect(cmdConvert('${alpha}', env)).toBe('%alpha%');
});

test(`Remove non-existent env from converted command`, () => {
    bIsWinMock.mockReturnValue(true);
    expect(cmdConvert('$bravo/$zulu/$charlie', env)).toBe('%bravo%//%charlie%');
});

test(`Remove empty env var from the converted command`, () => {
    bIsWinMock.mockReturnValue(true);
    expect(cmdConvert('$zulu/$alpha/$echo_empty', env)).toBe('/%alpha%/');
});

/*
    Index.js calls 'cmdConvert' with noramlize param as true for only command
*/

test(`Run normalize command on Windows`, () => {
    bIsWinMock.mockReturnValue(true);
    expect(cmdConvert('./cmd.bat', env, true)).toBe('cmd.bat');
});
