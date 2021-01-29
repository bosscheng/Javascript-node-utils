/**
 * Date:2021/1/29
 * Desc:
 */
const OS = require('os');

// x64_darwin_18.2.0
function getOS() {
    return OS.arch() + '_' + OS.platform() + '_' + OS.release();
}


module.exports = getOS;
