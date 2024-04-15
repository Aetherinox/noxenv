const crossSpawnMock = require('cross-spawn');
const bWinMock = require('../windows');

jest.mock('cross-spawn');
jest.mock('../windows');

const noxEnv = require('../');
const getSpawned = (call = 0) => crossSpawnMock.spawn.mock.results[call].value;

process.setMaxListeners(40);

beforeEach(() => {
    jest.spyOn(process, 'exit').mockImplementation(() => {});
    crossSpawnMock.spawn.mockReturnValue({ on: jest.fn(), kill: jest.fn() });
});

afterEach(() => {
    jest.clearAllMocks();
    process.exit.mockRestore();
});

test(`Set env and finish running command`, () => {
    testEnvSetting({ ALPHA_ENV: 'production' }, 'ALPHA_ENV=production');
});

test(`APPDATA undefined / not a string`, () => {
    testEnvSetting({ ALPHA_ENV: 'production', APPDATA: 2 }, 'ALPHA_ENV=production');
});

test(`Handle multiple env vars`, () => {
    testEnvSetting(
        {
            ALPHA_ENV: 'production',
            BRAVO_ENV: 'development',
            APPDATA: '0'
        },
        'ALPHA_ENV=production',
        'BRAVO_ENV=development',
        'APPDATA=0'
    );
});

test(`Handle special characters`, () => {
    testEnvSetting({ ALPHA_ENV: './!?' }, 'ALPHA_ENV=./!?');
});

test(`Handle single-quote strings`, () => {
    testEnvSetting({ ALPHA_ENV: 'bravo env' }, "ALPHA_ENV='bravo env'");
});

test(`Handle double-quote strings`, () => {
    testEnvSetting({ ALPHA_ENV: 'bravo env' }, 'ALPHA_ENV="bravo env"');
});

test(`Handle equal-sign in quoted strings`, () => {
    testEnvSetting({ ALPHA_ENV: 'alpha=bravo' }, 'ALPHA_ENV="alpha=bravo"');
});

test(`Handle empty single-quote strings`, () => {
    testEnvSetting({ ALPHA_ENV: '' }, "ALPHA_ENV=''");
});

test(`Handle empty double-quote strings`, () => {
    testEnvSetting({ ALPHA_ENV: '' }, 'ALPHA_ENV=""');
});

test(`Handle no value after the equal sign`, () => {
    testEnvSetting({ ALPHA_ENV: '' }, 'ALPHA_ENV=');
});

test(`Handle quoted scripts`, () => {
    noxEnv(['SALUTATION=Hi', 'NAME=Aetherinox', 'echo $SALUTATION && echo $NAME'], {
        shell: true
    });
    expect(crossSpawnMock.spawn).toHaveBeenCalledWith('echo $SALUTATION && echo $NAME', [], {
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, SALUTATION: 'Hi', NAME: 'Aetherinox' }
    });
});

test(`Handle escaped characters`, () => {
    /*
        escape \, ", ' and $
    */

    noxEnv(
        [
            'SALUTATION=Greetings',
            'NAME=Aetherinox',
            'echo \\"\\\'\\$SALUTATION\\\'\\" && echo $NAME'
        ],
        {
            shell: true
        }
    );
    expect(crossSpawnMock.spawn).toHaveBeenCalledWith('echo "\'$SALUTATION\'" && echo $NAME', [], {
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, SALUTATION: 'Greetings', NAME: 'Aetherinox' }
    });
});

test(`Skip when no command specified`, () => {
    noxEnv([]);
    expect(crossSpawnMock.spawn).toHaveBeenCalledTimes(0);
});

test(`Normalize commands on Windows`, () => {
    bWinMock.mockReturnValue(true);
    noxEnv(['./cmd.bat']);
    expect(crossSpawnMock.spawn).toHaveBeenCalledWith('cmd.bat', [], {
        stdio: 'inherit',
        env: { ...process.env }
    });
});

test(`Doesn't normalize command arguments on Windows`, () => {
    bWinMock.mockReturnValue(true);
    noxEnv(['echo', 'http://github.com']);
    expect(crossSpawnMock.spawn).toHaveBeenCalledWith('echo', ['http://github.com'], {
        stdio: 'inherit',
        env: { ...process.env }
    });
});

test(`Pass kill signals`, () => {
    testEnvSetting({ ALPHA_ENV: 'alpha=bravo' }, 'ALPHA_ENV="alpha=bravo"');

    process.emit('SIGTERM');
    process.emit('SIGINT');
    process.emit('SIGHUP');
    process.emit('SIGBREAK');

    const spawned = getSpawned();
    expect(spawned.kill).toHaveBeenCalledWith('SIGTERM');
    expect(spawned.kill).toHaveBeenCalledWith('SIGINT');
    expect(spawned.kill).toHaveBeenCalledWith('SIGHUP');
    expect(spawned.kill).toHaveBeenCalledWith('SIGBREAK');
});

test(`Keeps backslashes`, () => {
    bWinMock.mockReturnValue(true);
    noxEnv(['echo', '\\\\\\\\randomfolder\\\\randomfile']);
    expect(crossSpawnMock.spawn).toHaveBeenCalledWith('echo', ['\\\\randomfolder\\randomfile'], {
        stdio: 'inherit',
        env: { ...process.env }
    });
});

test(`Pass unhandled exit signal`, () => {
    const { spawned } = testEnvSetting({ ALPHA_ENV: 'alpha=bravo' }, 'ALPHA_ENV="alpha=bravo"');
    const spawnExitCallback = spawned.on.mock.calls[0][1];
    const spawnExitCode = null;

    spawnExitCallback(spawnExitCode);
    expect(process.exit).toHaveBeenCalledWith(1);
});

test(`Clean quit using SIGINT signal with null exit code`, () => {
    const { spawned } = testEnvSetting({ ALPHA_ENV: 'alpha=bravo' }, 'ALPHA_ENV="alpha=bravo"');
    const spawnExitCallback = spawned.on.mock.calls[0][1];
    const spawnExitCode = null;
    const spawnExitSignal = 'SIGINT';

    spawnExitCallback(spawnExitCode, spawnExitSignal);
    expect(process.exit).toHaveBeenCalledWith(0);
});

test(`Pass normal exit code`, () => {
    const { spawned } = testEnvSetting({ ALPHA_ENV: 'alpha=bravo' }, 'ALPHA_ENV="alpha=bravo"');
    const spawnExitCallback = spawned.on.mock.calls[0][1];
    const spawnExitCode = 0;

    spawnExitCallback(spawnExitCode);
    expect(process.exit).toHaveBeenCalledWith(0);
});

function testEnvSetting(expected, ...envSettings) {
    if (expected.APPDATA === 2) {
        /*
            kill APPDATA to test both undefined
        */

        const { env } = process;
        delete env.APPDATA;
        delete expected.APPDATA;
    } else if (!process.env.APPDATA && expected.APPDATA === '0') {
        /*
            Set APPDATa and test
        */

        process.env.APPDATA = '0';
    }

    const ret = noxEnv([...envSettings, 'echo', 'hello world']);
    const env = {};
    if (process.env.APPDATA) {
        env.APPDATA = process.env.APPDATA;
    }

    Object.assign(env, expected);
    const spawned = getSpawned();

    expect(ret).toBe(spawned);
    expect(crossSpawnMock.spawn).toHaveBeenCalledTimes(1);
    expect(crossSpawnMock.spawn).toHaveBeenCalledWith('echo', ['hello world'], {
        stdio: 'inherit',
        shell: undefined,
        env: { ...process.env, ...env }
    });

    expect(spawned.on).toHaveBeenCalledTimes(1);
    expect(spawned.on).toHaveBeenCalledWith('exit', expect.any(Function));

    return { spawned };
}
