import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { relative } from 'path'

import filescan from '../src/index.mjs'

const root = 'test/assets'

test('basic function', async () => {
  const list = []
  for await (const item of filescan(root + '/foo')) {
    const { path, stats, files } = item
    const rpath = relative(root, path)
    switch (rpath) {
      case 'foo':
        assert.equal(files, ['bar', 'baz', 'quux'])
        assert.ok(stats.isDirectory())
        break
      case 'foo/baz':
        assert.equal(files, ['foobar'])
        assert.ok(stats.isDirectory())
        break
      default:
        assert.not.ok(stats.isDirectory())
        assert.is(files, undefined)
    }
    list.push(rpath)
  }
  assert.equal(list, [
    'foo',
    'foo/bar',
    'foo/baz',
    'foo/baz/foobar',
    'foo/quux'
  ])
})

test('with prune', async t => {
  const list = []
  const options = { path: root + '/foo', prune: 'baz' }
  for await (const item of filescan(options)) {
    const { path } = item
    list.push(relative(root, path))
  }
  assert.equal(list, ['foo', 'foo/bar', 'foo/quux'])

  list.splice(0)
  options.prune = ['baz']
  for await (const item of filescan(options)) {
    const { path } = item
    list.push(relative(root, path))
  }
  assert.equal(list, ['foo', 'foo/bar', 'foo/quux'])
})

test('with depth', async t => {
  const list = []
  const options = { path: root + '/foo', depth: true }
  for await (const item of filescan(options)) {
    const { path } = item
    list.push(relative(root, path))
  }
  assert.equal(list, [
    'foo/bar',
    'foo/baz/foobar',
    'foo/baz',
    'foo/quux',
    'foo'
  ])
})

test.run()
