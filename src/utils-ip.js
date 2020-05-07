/**
 * Date:2020/4/23
 * Desc: 获取本机ip地址。
 */
const os = require('os');

let _ip = ''; //

module.exports = () => {
    let result = '';
    if (_ip) {
        return _ip;
    }

    let interfaces = os.networkInterfaces();
    for (let devName in interfaces) {
        let iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                result = alias.address;
            }
        }
    }

    _ip = result;

    return _ip;
};
