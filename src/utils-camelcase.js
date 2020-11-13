/**
 * Date:2020/11/13
 * Desc:
 */
module.exports = (str) => {
    return str.split('-').reduce((s, word) => {
        return s + word[0].toUpperCase() + word.slice(1);
    })
}
