const copyDir = require('../src/utils-copy-dir');
const path = require('path');

const src = path.join(__dirname, './a');
const dest = path.join(__dirname, './b');


let result = copyDir(src, dest);

console.log(result);
