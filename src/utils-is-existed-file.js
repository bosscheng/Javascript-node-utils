/**
 * Date:2020/11/13
 * Desc:
 */
const fs = require('fs');

module.exports = (file) => {
    file = file.replace(/(\?|#).*$/, '');
    return fs.existsSync(file) && fs.statSync(file).isFile();
};
