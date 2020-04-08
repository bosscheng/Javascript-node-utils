/**
 * Date:2020/4/8
 * Desc:
 */

function supportAsyncFunctions() {
    try {
        new Function('(async function(){})');
        return true;
    } catch (e) {
        return false
    }
}

//  为方便起见，还可以通过全局模块的 exports 访问 module.exports。 module 实际上不是全局的，而是每个模块本地的
exports.supportAsyncFunctions = supportAsyncFunctions;