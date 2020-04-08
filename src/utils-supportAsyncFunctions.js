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