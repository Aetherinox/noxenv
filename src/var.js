const bIsWindows = require('./windows');
const pathEnvWhitelist = new Set(['PATH', 'NODE_PATH']);

module.exports = envConvertVar;

/*
    convert *nix-style values to windows.
    (*NIX): $PATH:"/usr/bin:/usr/local/bin:." => (Windows) "/usr/bin;/usr/local/bin;."

    @arg str val
        original env value
    @arg str envName
        original env name
    @ret str
        converted value
*/

function replaceListDelims(val, envName = '') {
    const sep = bIsWindows() ? ';' : ':';
    if (!pathEnvWhitelist.has(envName)) {
        return val;
    }

    return val.replace(/(\\*):/g, (match, charBackslash) => {
        if (charBackslash.length % 2) {
            /*
                odd num of backslahes preceding = escaped
                remove -1 backslash and return the remaining
            */

            return match.substr(1);
        }
        return charBackslash + sep;
    });
}

/*
    resolve env value inside string.

    only called on right side portion of env var.

    Example:    noxenv VAR_ALPHA=$NODE_ENV VAR_BRAVO=\\$NODE_ENV echo $VAR_ALPHA $VAR_BRAVO
                VAR_ALPHA=development VAR_BRAVO=$NODE_ENV echo $VAR_ALPHA

                transform the string VAR_ALPHA="$NODE_ENV" into VAR_ALPHA="development"

    @arg str val
        original value of env
    @ret str
        converted value
*/

function envResolveVars(val) {
    /*
        envUnixRegex        : $my_var or ${ my_var } or \$my_var
    */

    const envUnixRegex = /(\\*)(\$(\w+)|\${(\w+)})/g;
    return val.replace(envUnixRegex, (_, escapeChars, envNameNoDSign, envName, envNameAlt) => {
        /*
                do not replace anything proceded by odd number of backslashes \
            */

        if (escapeChars.length % 2 === 1) {
            return envNameNoDSign;
        }

        return (
            escapeChars.substr(0, escapeChars.length / 2) +
            (process.env[envName || envNameAlt] || '')
        );
    });
}

/*
    convert env value for correct operating system

    @arg str envOrigValue
        original env value
    @arg str envOrigName
        original env name
    @ret str
        converted value
*/

function envConvertVar(envOrigValue, envOrigName) {
    return envResolveVars(replaceListDelims(envOrigValue, envOrigName));
}
