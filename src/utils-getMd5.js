
let crypto = require('crypto');

function getMd5(buffer) {
    let md5 = crypto.createHash('md5');
    md5.update(buffer);
    return md5.digest('hex');
}


module.exports = getMd5;