import { lstat, readdir } from 'fs/promises'
import { join } from 'path'

export default async function * filescan (options) {
  if (typeof options === 'string') options = { path: options }
  let { path: root, prune, depth } = options
  if (!prune) prune = []
  if (!Array.isArray(prune)) prune = [prune]
  prune = new Set(prune.map(path => join(root, path)))

  yield * scan(root)

  async function * scan (path) {
    if (prune.has(path)) return
    const stats = await lstat(path)
    if (!stats.isDirectory()) {
      yield { path, stats }
      return
    }
    let files = await readdir(path)
    files.sort()
    if (!depth) yield { path, stats, files }
    for (const file of files) {
      yield * scan(join(path, file))
    }
    if (depth) {
      files = await readdir(path)
      files.sort()
      yield { path, stats, files }
    }
  }
}
