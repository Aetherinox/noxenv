#!/usr/bin/env node

const noxEnv = require('..');
noxEnv(process.argv.slice(2), { shell: true });
