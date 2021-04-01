const {spawn} = require("child_process");

function spawnAsync(...options) {
    let data = '';
    let error = '';

    const doSpawn = spawn(...options);

    doSpawn.stdout.on('data', d => {
        data += d;
    });

    doSpawn.stderr.on('data', e => {
        error += e;
    });

    return new Promise((resolve, reject) => {
        doSpawn.on('error', reject);
        doSpawn.on('close', code => {
            if (code === 0) {
                resolve(data.toString());
            } else {
                const _error = new Error(`child exited with code ${code}`);
                _error.code = code;
                _error.stderr = error.toString();
                reject(_error);
            }
        })
    })
}