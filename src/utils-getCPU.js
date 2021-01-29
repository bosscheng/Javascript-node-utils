/**
 * Date:2021/1/29
 * Desc:
 */

const OS = require('os');

// 8 x Intel(R) Core(TM) i7-8550U CPU @ 1.80GHz
function getCPU() {
    return OS.cpus().length + ' x ' + OS.cpus()[0].model
}


module.exports = getCPU
