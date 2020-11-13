/**
 * Date:2020/11/13
 * Desc:
 */

const os = require('os');

module.exports = (() => {
    const platform = os.platform();

    return {
        isWindows: platform.indexOf('win') === 0 || platform === 'cygwin',
        isLinux: platform === 'linux' || platform === 'freebsd',
        isOSX: platform === 'darwin'
    }
})()
