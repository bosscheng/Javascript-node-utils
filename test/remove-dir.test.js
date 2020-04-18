const removeDir = require('../src/utils-remove-dir');
const path = require('path');

const dir = path.join(__dirname,'./b');

const result = removeDir(dir);
console.log(result);
