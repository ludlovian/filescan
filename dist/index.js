'use strict';

var util = require('util');
var path = require('path');

async function * filescan (options) {
  if (typeof options === 'string') options = { path: options };
  let { path: root, fs, prune, depth } = options;
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
    if (!stats.isDirectory()) {
      yield { path: path$1, stats };
      return
    }
    let files = await readdir(path$1);
    files.sort();
    if (!depth) yield { path: path$1, stats, files };
    for (const file of files) {
      yield * scan(path.join(path$1, file));
    }
    if (depth) {
      files = await readdir(path$1);
      files.sort();
      yield { path: path$1, stats, files };
    }
  }
}

module.exports = filescan;
