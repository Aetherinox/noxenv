const { spawn } = require('cross-spawn');
const cmdConvert = require('./cmd');
const envConvertVar = require('./var');

module.exports = noxEnv;

const envSetterRegex = /(\w+)=('(.*)'|"(.*)"|(.*))/;

function noxEnv(args, options = {}) {
    const [envSetters, cmd, cmdArgs] = parseCommand(args);
    const env = getEnvVars(envSetters);

    if (cmd) {
        const proc = spawn(
            /*
                run path.normalize for cmd on windows
            */

            cmdConvert(cmd, env, true),

            /*
                normalize is false by default; do not run on cmd args
            */

            cmdArgs.map((arg) => cmdConvert(arg, env)),
            {
                stdio: 'inherit',
                shell: options.shell,
                env
            }
        );

        process.on('SIGTERM', () => proc.kill('SIGTERM'));
        process.on('SIGINT', () => proc.kill('SIGINT'));
        process.on('SIGBREAK', () => proc.kill('SIGBREAK'));
        process.on('SIGHUP', () => proc.kill('SIGHUP'));

        proc.on('exit', (code, signal) => {
            let exitCode = code;

            /*
                exit code may be null when operating system kills the process for any number of reasons.
                    IE: out of memory, hanging, etc.

                SIGINT means user exited process; return exit code 0
            */

            if (exitCode === null) {
                exitCode = signal === 'SIGINT' ? 0 : 1;
            }

            process.exit(exitCode);
        });
        return proc;
    }
    return null;
}

function parseCommand(args) {
    const envSetters = {};
    let cmd = null;
    let cmdArgs = [];

    for (let i = 0; i < args.length; i++) {
        const match = envSetterRegex.exec(args[i]);
        if (match) {
            let val;

            if (typeof match[3] !== 'undefined') {
                val = match[3];
            } else if (typeof match[4] === 'undefined') {
                val = match[5];
            } else {
                val = match[4];
            }

            envSetters[match[1]] = val;
        } else {
            /*
                no more env setters remain; the rest of the line is the command and arguments
            */

            let cStart = [];
            cStart = args
                .slice(i)

                /*
                    regex:  match "\'" or "'"
                            match "\" if followed by [$"\] (lookahead)
                */

                .map((a) => {
                    const re = /\\\\|(\\)?'|([\\])(?=[$"\\])/g;
                    // Eliminate all matches except for "\'" => "'"
                    return a.replace(re, (m) => {
                        if (m === '\\\\') return '\\';
                        if (m === "\\'") return "'";
                        return '';
                    });
                });

            cmd = cStart[0];
            cmdArgs = cStart.slice(1);

            break;
        }
    }

    return [envSetters, cmd, cmdArgs];
}

function getEnvVars(envSetters) {
    const envVars = { ...process.env };

    if (process.env.APPDATA) {
        envVars.APPDATA = process.env.APPDATA;
    }

    Object.keys(envSetters).forEach((varName) => {
        envVars[varName] = envConvertVar(envSetters[varName], varName);
    });

    return envVars;
}
