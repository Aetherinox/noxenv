const bWinMock = require('../windows');
const varValue = require('../var');

jest.mock('../windows');

const testJson = '{\\"alpha\\":\\"bravo\\"}';

beforeEach(() => {
    process.env.VAR1 = 'test_value_1';
    process.env.VAR2 = 'test_value_2';
    process.env.JSON_VAR = testJson;
});

afterEach(() => {
    const { env } = process;
    delete env.VAR1;
    delete env.VAR2;
    delete env.JSON_VAR;
    jest.clearAllMocks();
});

test(`Don't affect simple var values`, () => {
    bWinMock.mockReturnValue(true);
    expect(varValue('alpha')).toBe('alpha');
});

test(`Don't convert ; -> : on *NIX`, () => {
    bWinMock.mockReturnValue(false);
    expect(varValue('alpha;bravo', 'PATH')).toBe('alpha;bravo');
});

test(`Don't convert ; -> : for non-PATH on *NIX`, () => {
    bWinMock.mockReturnValue(false);
    expect(varValue('alpha;bravo', 'FOO')).toBe('alpha;bravo');
});

test(`Don't convert ; -> : for non-PATH on Windows`, () => {
    bWinMock.mockReturnValue(true);
    expect(varValue('alpha;bravo', 'FOO')).toBe('alpha;bravo');
});

test(`Do convert : -> ; on Windows if PATH exists`, () => {
    bWinMock.mockReturnValue(true);
    expect(varValue('alpha:bravo', 'PATH')).toBe('alpha;bravo');
});

test(`Don't convert separators already valid`, () => {
    bWinMock.mockReturnValue(false);
    expect(varValue('alpha:bravo')).toBe('alpha:bravo');
});

test(`Don't convert escaped separators on Windows if PATH exists`, () => {
    bWinMock.mockReturnValue(true);
    expect(varValue('alpha\\:bravo', 'PATH')).toBe('alpha:bravo');
});

test(`Don't convert escaped separators on *NIX`, () => {
    bWinMock.mockReturnValue(false);
    expect(varValue('alpha\\:bravo', 'PATH')).toBe('alpha:bravo');
});

test(`Do convert a separator even if preceded by an escaped backslash`, () => {
    bWinMock.mockReturnValue(true);
    expect(varValue('alpha\\\\:bravo', 'PATH')).toBe('alpha\\\\;bravo');
});

test(`Do convert multiple separators if PATH exists`, () => {
    bWinMock.mockReturnValue(true);
    expect(varValue('alpha:bravo:baz', 'PATH')).toBe('alpha;bravo;baz');
});

test(`Do resolve an env var value`, () => {
    bWinMock.mockReturnValue(true);
    expect(varValue('alpha-$VAR1')).toBe('alpha-test_value_1');
});

test(`Do resolve an env var value with curly syntax`, () => {
    bWinMock.mockReturnValue(true);
    // eslint-disable-next-line no-template-curly-in-string
    expect(varValue('alpha-${VAR1}')).toBe('alpha-test_value_1');
});

test(`Do resolve multiple env var values`, () => {
    bWinMock.mockReturnValue(true);
    expect(varValue('alpha-$VAR1-$VAR2')).toBe('alpha-test_value_1-test_value_2');
});

test(`Do resolve env var value for non-existant var`, () => {
    bWinMock.mockReturnValue(true);
    expect(varValue('alpha-$VAR_NOTREAL')).toBe('alpha-');
});

test(`Do resolve env var with a JSON string value on *NIX`, () => {
    bWinMock.mockReturnValue(false);
    expect(varValue('$JSON_VAR')).toBe(testJson);
});

test(`Do resolve env var with a JSON string value on Windows`, () => {
    bWinMock.mockReturnValue(true);
    expect(varValue('$JSON_VAR')).toBe(testJson);
});

test(`Don't resolve an env var prefixed with \\ on *NIX`, () => {
    bWinMock.mockReturnValue(false);
    expect(varValue('\\$VAR1')).toBe('$VAR1');
});

test(`Don't resolve an env var prefixed with \\ on Windows`, () => {
    bWinMock.mockReturnValue(true);
    expect(varValue('\\$VAR1')).toBe('$VAR1');
});

test(`Do resolve an env var prefixed with \\\\ on *NIX`, () => {
    bWinMock.mockReturnValue(false);
    expect(varValue('\\\\$VAR1')).toBe('\\test_value_1');
});

test(`Do resolve an env var prefixed with \\\\ on Windows`, () => {
    bWinMock.mockReturnValue(true);
    expect(varValue('\\\\$VAR1')).toBe('\\test_value_1');
});
