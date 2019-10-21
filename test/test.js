'use strict'

import test from 'ava'
import filescan from '../src'
import sinon from 'sinon'

// foo/
// foo/quux
// foo/bar
// foo/baz/
// foo/baz/foobar
//
const fs = {
  lstat (path, cb) {
    const ret = {
      path,
      isDirectory () {
        return path === 'foo' || path === 'foo/baz'
      }
    }
    Promise.resolve().then(() => cb(undefined, ret))
  },
  readdir (path, cb) {
    let ret = null
    if (path === 'foo') ret = ['quux', 'bar', 'baz']
    if (path === 'foo/baz') ret = ['foobar']
    Promise.resolve().then(() => cb(undefined, ret))
  }
}

test('basic function', async t => {
  const list = []
  const options = { path: 'foo', fs }
  for await (const item of filescan(options)) {
    const { path, stats, files } = item
    t.is(stats.path, path)
    switch (path) {
      case 'foo':
        t.deepEqual(files, ['bar', 'baz', 'quux'])
        break
      case 'foo/baz':
        t.deepEqual(files, ['foobar'])
        break
      default:
        t.is(files, undefined)
    }
    list.push(path)
  }
  t.deepEqual(list, ['foo', 'foo/bar', 'foo/baz', 'foo/baz/foobar', 'foo/quux'])
})

test('with prune', async t => {
  const list = []
  const options = { path: 'foo', fs, prune: 'baz' }
  for await (const item of filescan(options)) {
    const { path, stats } = item
    t.is(stats.path, path)
    list.push(path)
  }
  t.deepEqual(list, ['foo', 'foo/bar', 'foo/quux'])

  list.splice(0)
  options.prune = ['baz']
  for await (const item of filescan(options)) {
    const { path, stats } = item
    t.is(stats.path, path)
    list.push(path)
  }
  t.deepEqual(list, ['foo', 'foo/bar', 'foo/quux'])
})

test('with no fs', async t => {
  const _fs = require('fs')
  sinon.replace(_fs, 'lstat', fs.lstat)
  sinon.replace(_fs, 'readdir', fs.readdir)

  const list = []
  const options = 'foo'
  for await (const item of filescan(options)) {
    const { path, stats } = item
    t.is(stats.path, path)
    list.push(path)
  }
  t.deepEqual(list, ['foo', 'foo/bar', 'foo/baz', 'foo/baz/foobar', 'foo/quux'])

  sinon.restore()
})

test('with depth', async t => {
  const list = []
  const options = { path: 'foo', fs, depth: true }
  for await (const item of filescan(options)) {
    const { path, stats } = item
    t.is(stats.path, path)
    list.push(path)
  }
  t.deepEqual(list, ['foo/bar', 'foo/baz/foobar', 'foo/baz', 'foo/quux', 'foo'])
})
