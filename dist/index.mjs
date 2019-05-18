import { promisify } from 'util';
import { join } from 'path';

async function * filescan (options) {
  if (typeof options === 'string') options = { path: options };
  let { path: root, fs, prune, depth } = options;
  if (!fs) fs = require('fs');
  if (!prune) prune = [];
  if (!Array.isArray(prune)) prune = [prune];
  prune = new Set(prune.map(path => join(root, path)));
  const lstat = promisify(fs.lstat);
  const readdir = promisify(fs.readdir);
  yield * scan(root);
  async function * scan (path) {
    if (prune.has(path)) return
    const stats = await lstat(path);
    if (!stats.isDirectory()) {
      yield { path, stats };
      return
    }
    let files = await readdir(path);
    files.sort();
    if (!depth) yield { path, stats, files };
    for (const file of files) {
      yield * scan(join(path, file));
    }
    if (depth) {
      files = await readdir(path);
      files.sort();
      yield { path, stats, files };
    }
  }
}

export default filescan;
