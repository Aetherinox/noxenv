const path = require('path');
const bIsWindows = require('./windows');

module.exports = cmdConvert;

/*
    Convert env var usage depending on the current OS

    @arg str    cmd
    @arg obj    env
    @arg bool   normalize
    @ret str    command
*/

function cmdConvert(cmd, env, bNormalize = false) {
    if (!bIsWindows()) {
        return cmd;
    }

    /*
        $var_foo or ${ var_foo }
    */

    const envUnixRegex = /\$(\w+)|\${(\w+)}/g;
    const cmdConverted = cmd.replace(envUnixRegex, (match, $1, $2) => {
        const name = $1 || $2;

        /*
            if env name isnt defined at runtime, strip from command completely
        */

        return env[name] ? `%${name}%` : '';
    });

    /*
        normalizing is required for commands with relative paths, but not done for command arguments
        ex: ./myCmd.bat
    */

    return bNormalize === true ? path.normalize(cmdConverted) : cmdConverted;
}
