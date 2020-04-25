/**
 * Date: 4/25/20
 */
const path = require('path');
const fs = require('fs');

module.exports = (dirName, filePath) => {
    // step1: 分割 filePath, 获取filePath 路径（需要移除掉最后一位的文件名xxx.js）
    // step2: 解析 dirname 是否存在。
    // step3: 动态创建 文件夹
    let result = false;
    if (!dirName || !filePath) {
        return result;
    }

    let pathArray = filePath.split('/'); // 分割

    // dirName 必须存在 且是 目录
    if (fs.existsSync(dirName) && fs.statSync(dirName).isDirectory()) {

        let tempPath = dirName; //

        // 动态创建目录
        for (let i = 0, len = pathArray.length; i < (len - 1); i++) {
            let temp = pathArray[i];
            if (temp) {
                tempPath = path.join(tempPath, temp);
                try {
                    if (!fs.existsSync(tempPath)) {
                        fs.mkdirSync(tempPath);
                    }
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
        result = true;
    }

    return result;
};