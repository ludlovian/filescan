'use strict'

import { promisify } from 'util'
import { join } from 'path'

export default async function * filescan (options) {
  if (typeof options === 'string') options = { path: options }
  let { path: root, fs, prune } = options
  if (!fs) fs = require('fs')
  if (!prune) prune = []
  if (!Array.isArray(prune)) prune = [prune]
  prune = new Set(prune.map(path => join(root, path)))

  const lstat = promisify(fs.lstat)
  const readdir = promisify(fs.readdir)

  yield * scan(root)

  async function * scan (path) {
    if (prune.has(path)) return
    const stats = await lstat(path)
    yield { path, stats }
    if (!stats.isDirectory()) return
    const files = await readdir(path)
    files.sort()
    for (const file of files) {
      yield * scan(join(path, file))
    }
  }
}
