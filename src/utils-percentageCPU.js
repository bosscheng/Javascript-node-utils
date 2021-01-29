/**
 * Date:2021/1/29
 * Desc:
 */
const OS = require('os');

function cpuAverage() {

    //Initialise sum of idle and time of cores and fetch CPU info
    let totalIdle = 0, totalTick = 0;
    let cpus = OS.cpus();

    //Loop through CPU cores
    for (let i = 0, len = cpus.length; i < len; i++) {

        //Select CPU core
        let cpu = cpus[i];

        //Total up the time in the cores tick
        for (let type in cpu.times) {
            totalTick += cpu.times[type];
        }

        //Total up the idle time of the core
        totalIdle += cpu.times.idle;
    }

    //Return the average Idle and Tick times
    return {idle: totalIdle / cpus.length, total: totalTick / cpus.length};
}

function percentageCPU() {
    return new Promise(function (resolve, reject) {
        let startMeasure = cpuAverage();
        setTimeout(() => {
            let endMeasure = cpuAverage();
            //Calculate the difference in idle and total time between the measures
            let idleDifference = endMeasure.idle - startMeasure.idle;
            let totalDifference = endMeasure.total - startMeasure.total;

            //Calculate the average percentage CPU usage
            let percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);
            resolve(percentageCPU);
        }, 100);
    });
}

module.exports = percentageCPU;
