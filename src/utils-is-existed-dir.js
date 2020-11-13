/**
 * Date:2020/11/13
 * Desc:
 */

const fs = require('fs');

module.exports = (dir)=>{
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory()
}
