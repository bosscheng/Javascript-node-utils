const fs = require('fs');
const path = require('path');

/**
 *
 * @param src
 * @param dst
 * @returns {boolean}
 */
module.exports = function copyDir(src, dst) {
    if (!fs.existsSync(src) || !fs.statSync(src).isDirectory()) {
        return false;
    }

    if (!fs.existsSync(dst) || !fs.statSync(dst).isDirectory()) {
        return false;
    }

    // 读取 目录结构
    let list = fs.readdirSync(src);
    //
    for (let i = 0, len = list.length; i < len; i++) {
        let fileName = path.join(src, list[i]);

        let stat = fs.statSync(fileName);

        if (stat.isDirectory()) {
            // 查看目录是否存在，如果不存在，创建一个
            let dstTempDir = path.join(dst, list[i]);
            if (!fs.existsSync(dstTempDir)) {
                fs.mkdirSync(dstTempDir);
            }
            copyDir(fileName, dstTempDir);
        } else {
            // 直接复制过去
            let tempContent = fs.readFileSync(fileName, 'utf8');
            fs.writeFileSync(path.join(dst, list[i]), tempContent, 'utf8');
        }
    }

    return true;
};
