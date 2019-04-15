'use strict';

var util = require('util');
var path = require('path');

async function * filescan (options) {
  if (typeof options === 'string') options = { path: options };
  let { path: root, fs, prune } = options;
  if (!fs) fs = require('fs');
  if (!prune) prune = [];
  if (!Array.isArray(prune)) prune = [prune];
  prune = new Set(prune.map(path$1 => path.join(root, path$1)));
  const lstat = util.promisify(fs.lstat);
  const readdir = util.promisify(fs.readdir);
  yield * scan(root);
  async function * scan (path$1) {
    if (prune.has(path$1)) return
    const stats = await lstat(path$1);
    yield { path: path$1, stats };
    if (!stats.isDirectory()) return
    const files = await readdir(path$1);
    files.sort();
    for (const file of files) {
      yield * scan(path.join(path$1, file));
    }
  }
}

module.exports = filescan;
