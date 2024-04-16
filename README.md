<div align="center">
<h1>noxenv 🔅</h1>
<br />
<p>Set and get environment variables in your node project across different platforms</p>

<br />

<!-- prettier-ignore-start -->
[![Test Status][test-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![Version][version]][package]
[![Last Commit][badge-commit]][badge-commit]
[![Size][badge-size]][badge-size]
[![All Contributors][all-contributors-badge]](#contributors-)
<!-- prettier-ignore-end -->

</div>

---

<br />

- [About](#about)
- [Installation](#installation)
- [Usage](#usage)
- [`noxenv` \& `noxenv-shell`](#noxenv--noxenv-shell)
- [Windows Users](#windows-users)
- [Contributors ✨](#contributors-)
- [Creds](#creds)

<br />

---

<br />

## About

Most Windows-based command prompts / terminals will have issues when you attempt to set env variables utilizing `NODE_ENV=production`; unless you are using [Bash on Windows][win-bash]. Coupled with the issue that Windows and *NIX have different ways of utilizing env variables such as
- Windows: `%ENV_VAR%`
- *NIX: `$ENV_VAR`

<br />

`noxenv` gives you the ability to have a single command at your disposal; without the hassle of worrying about different platforms. Specify your env variable as you would on *nix, and noxenv will take care of the conversion for Windows users.

<br />

> [!NOTE]
> `noxenv` only supports Node.js v14 and higher.

<br />

---

<br />

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node]. To utilize this moduke, add it to your project's `package.json` -> `devDependencies`:

```json
"devDependencies": {
    "@aetherinox/noxenv": "^1.0.0"
},
```

To install it via the npm command-line as a `devDependency`:

<br />

```
npm i --save-dev @aetherinox/noxenv
```

<br />

---

<br />

## Usage
Some examples have been provided below to show various ways of using noxenv:

<br />

```json
{
    "scripts": {
        "build": "noxenv NODE_ENV=production webpack --config build/webpack.config.js",
        "build-rollup": "noxenv NODE_ENV=production rollup -c",
        "development": "noxenv NODE_ENV=development npm start",
        "production": "noxenv NODE_ENV=production SERVER_IP=http://127.0.0.1 npm start",
        "test": "noxenv BABEL_ENV=test jest test/app",
        "start-dev": "noxenv NODE_ENV=development PORT_ENV=2350 npm run build && node dist/src/main.js",
        "openssl-legacy": "noxenv NODE_OPTIONS=\"--openssl-legacy-provider\" tsc -p tsconfig.json"
    }
}
```

<br />

Inside your module, you can call these env variables with something similar to the below example:

```javascript
const TEST = { api: "f4dcc990-f8f7-4343-b852-a2065b4445d5" };
const PROD = { api: "d1ac1eb8-7194-4095-8976-04be09378611" };

let target;
if (process.env.BABEL_ENV === "test") {
    target = TEST;
} else if (process.env.BABEL_ENV === "prod") {
    target = PROD;
}

console.log(`Your API key is ${target} in ${process.env.BABEL_ENV} mode`);
```

<br />

In the above example, variables such as `BABEL_ENV` will be set by `noxenv`. 

You can also set multiple environment variables at a time:

```json
{
    "scripts": {
        "release-beta": "noxenv RELEASE=beta ENV=dev PORT=7732 npm run release && npm run start",
    }
}
```

<br />

Additionally; you can split the command into several actions, or separate the env variable declarations from the actual command execution; note the following example:

```json
{
    "scripts": {
        "main": "noxenv USER_NAME=\"Joe\" npm run child",
        "child": "noxenv-shell \"echo Hello $USER_NAME\""
    }
}
```

<br />

In the above example, `child` stores the actual command to execute, and `main` sets the env variable that is going to be used. In this case, `Joe` is the user we want to say hello to, so we store Joe's name in within the env variable `USER_NAME`, and then at the end of `main`, we call `child` which does the actual greeting.

This means that you only need to call `main`, and both will be ran. Additionally, it also means that you can also call the env variable using `$USER_NAME` on Windows, even though the typical Windows syntax is `%USER_NAME%`.

If you wish to pass a JSON string (such as when using [ts-loader]), you may do the following:

<br />

```json
{
    "scripts": {
        "test": "noxenv TS_NODE_COMPILER_OPTIONS={\\\"module\\\":\\\"commonjs\\\"} mocha --config ./test.js"
    }
}
```

<br />

Take note of the `triple backslashes` `(\\\)` before `double quotes` `(")` and the absence of `single quotes` `(')`. Both of these conditions are vital and required in order for the env var to work on both on Windows and *NIX.

<br />

---

<br />

## `noxenv` & `noxenv-shell`

`noxenv` provides two binary files: `noxenv` and `noxenv-shell`.

<br />

| Binary | Description |
| --- | --- |
| `noxenv` | Executes commands utilizing [`cross-spawn`][cross-spawn] |
| `noxenv-shell` | Executes commands utilizing node's `shell`. Useful when you need an env var to be set across an entire shell script, rather than a single command. Also used when wanting to pass a command that contains special shell characters that you need interpreted |

<br />

If you want to have the env variable apply to several commands in a series, you will need to wrap them in quotes and use `noxenv-shell`, instead of `noxenv`.

```json
{
    "scripts": {
        "salutation": "noxenv-shell SALUTATION=Howdy NAME=Aetherinox \"echo $SALUTATION && echo $NAME\""
    }
}
```

<br />

If you need to handle [signal events](https://nodejs.org/api/process.html#process_signal_events) within your project, use `noxenv-shell`. An example use for this is when you want to capture the `SIGINT` event invoked by pressing `Ctrl + C` within your command-line interface.

<br />

---

<br />

## Windows Users

Note that `npm` uses `cmd` by default and doesn't support command substitution, so if you want to leverage that, then you need to update your `.npmrc` and set `script-shell` to powershell.

<br />

---

<br />

## Contributors ✨
The following people have helped get this project going:

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors][all-contributors-badge]](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://gitlab.com/Aetherinox"><img src="https://avatars.githubusercontent.com/u/118329232?v=4?s=40" width="40px;" alt="Aetherinox"/><br /><sub><b>Aetherinox</b></sub></a><br /><a href="https://github.com/Aetherinox/noxenv/commits?author=Aetherinox" title="Code">💻</a> <a href="#projectManagement-Aetherinox" title="Project Management">📆</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

<br />

---

<br />

## Creds
This is based on the older module `cross-env` which is a great asset, however, I needed updated dependencies and additional functionality; along with the ability to implement whatever I need. Including  plans for rollup. This is more of a personal project, but if anyone finds it useful; you're free to use it. All the original functionality is included, just updates. Also going to be adding config / `.env` file support.

<br />

---

<br />

<!-- prettier-ignore-start -->
[npm]: https://npmjs.com
[node]: https://nodejs.org
[badge-commit]: https://img.shields.io/github/last-commit/Aetherinox/noxenv?color=b43bcc
[badge-size]: https://img.shields.io/github/repo-size/Aetherinox/noxenv?label=size&color=59702a
[test-badge]: https://img.shields.io/github/actions/workflow/status/Aetherinox/noxenv/npm-tests.yml?logo=github&label=Tests&color=%23278b30
[build]: https://github.com/Aetherinox/noxenv/actions/workflows/npm-publish.yml?query=workflow%3Anpm-publish.yml
[coverage-badge]: https://img.shields.io/codecov/c/github/Aetherinox/xsumjs?token=MPAVASGIOG&logo=codecov&logoColor=FFFFFF&label=Coverage&color=354b9e
[coverage]: https://codecov.io/github/Aetherinox/noxenv
[version]: https://img.shields.io/npm/v/@aetherinox/noxenv
[package]: https://npmjs.com/package/@aetherinox/noxenv
[downloads-badge]: https://img.shields.io/npm/dm/noxenv.svg
[npmtrends]: http://npmtrends.com/noxenv
[license-badge]: https://img.shields.io/npm/l/noxenv.svg
[license]: https://github.com/Aetherinox/noxenv/blob/master/LICENSE
[all-contributors]: https://github.com/all-contributors/all-contributors
[all-contributors-badge]: https://img.shields.io/github/all-contributors/Aetherinox/noxenv?color=de1f6f&label=contributors
[cross-spawn]: https://www.npmjs.com/package/cross-spawn
[ts-loader]: https://www.npmjs.com/package/ts-loader
[win-bash]: https://msdn.microsoft.com/en-us/commandline/wsl/about
<!-- prettier-ignore-end -->
