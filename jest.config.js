const jest = require('kcd-scripts/jest');

module.exports = {
    ...jest,
    rootDir: __dirname,
    roots: [__dirname],
    displayName: 'noxenv',
    coveragePathIgnorePatterns: [...jest.coveragePathIgnorePatterns, '/bin/'],
    testMatch: ['**/tests/*.js?(x)'],
    prettierPath: require.resolve('prettier'),
    verbose: true,
    coverageThreshold: {
        global: {
            statements: 70,
            branches: 65,
            lines: 70,
            functions: 70
        }
    }
};
