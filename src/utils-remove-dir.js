const fs = require('fs');
const path = require('path');

module.exports = function removeDir(dir) {
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
        return false;
    }

    let list = fs.readdirSync(dir);
    //
    for (let i = 0, len = list.length; i < len; i++) {
        let fileName = path.join(dir, list[i]);

        let stat = fs.statSync(fileName);

        if (stat.isDirectory()) {
            removeDir(fileName);
        } else {
            fs.unlinkSync(fileName);
        }
    }
    // remove empty dir
    fs.rmdirSync(dir);

    return true;
};
