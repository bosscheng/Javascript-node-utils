/**
 * Date: 4/25/20
 */

function now() {
    return Date.now ? Date.now() : (new Date()).valueOf();
}

module.exports = (str) => {
    let hasParam = str.indexOf('?') !== -1;

    if (hasParam) {
        str = str + '&_=' + now();
    } else {
        str = str + '?_=' + now();
    }

    return str;
};