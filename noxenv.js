#!/usr/bin/env node

const fs = require('fs');
const { v5: uuid } = require('uuid');

/*
 *    declrations > package.json
 */

const { version, repository } = JSON.parse(fs.readFileSync('./package.json'));

//  Execute:
//      npx --quiet env-cmd --no-override node noxenv.js generate
//      npx --quiet env-cmd --no-override node noxenv.js version
//      npx --quiet env-cmd --no-override node noxenv.js guid
//      npx --quiet env-cmd --no-override node noxenv.js uuid

const args = process.argv.slice(2, process.argv.length);
const action = args[0];
//const a       = args[ 1 ];
//const b       = args[ 2 ];

if (action === 'guid') {
    console.log(`${process.env.GUID}`);
} else if (action === 'setup') {
    fs.writeFileSync('.env', '', (err) => {
        if (err) {
            console.error(err);
        } else {
            // file written successfully
        }
    });
} else if (action === 'generate') {
    const build_guid = uuid(`${repository.url}`, uuid.URL);
    const build_uuid = uuid(version, build_guid);

    const ids = `
GUID=${build_guid}
UUID=${build_uuid}
`;

    console.log(build_guid);
    console.log(build_uuid);

    fs.writeFileSync('.env', ids, (err) => {
        if (err) {
            console.error(`Could not write env vars: ${err}`);
        } else {
            console.log('write env vars');
        }
    });
} else if (action === 'uuid') {
    console.log(`${process.env.UUID}`);
} else {
    console.log(require('./package.json').version);
}

process.exit(0);
