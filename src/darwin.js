module.exports = () =>
    process.platform === 'darwin' || /^(darwin|freebsd)$/.test(process.env.OSTYPE);
