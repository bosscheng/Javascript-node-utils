/**
 * Date:2020/11/13
 * Desc:
 */
module.exports = (resolvedPath) => {
    delete require.cache[resolvedPath];
    return require(resolvedPath);
};
