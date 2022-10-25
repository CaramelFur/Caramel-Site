const probe = require('probe-image-size');
const fs = require('fs');
const path = require('path');

const easyProbe = async (src, options) => {
  // if src does not start with http, fetch a stream from the local file system
  let probeTarget = src;
  if (!src.startsWith('http')) {
    const basePath = options.basePath || './';
    probeTarget = await fs.createReadStream(path.join(basePath, src));
  }
  return probe(probeTarget, options);
};

module.exports = easyProbe;
