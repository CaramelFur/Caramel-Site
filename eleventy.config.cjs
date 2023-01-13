const deasyncPromise = require('deasync-promise');
const importPromise = import('./lib/build.js');

module.exports = deasyncPromise(importPromise).default;
console.log(module.exports);
