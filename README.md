# filescan

Async iterator providing recursive scan of files

Inspired by `klaw`

## API

```
import filescan from 'filescan'

for await (const { path, stats } of filescan(root)) { ... }
```

### filescan

`filescan(path | options)`

Returns an async iterable that yields `{ path, stats, files }` for each file/dir found.

`files` is a sorted list of the names in the directory (or `undefined` if not a dir)

Params can be provided as a string (the start path), or an object with:
- path (mandatory) - the start path
- fs - the `fs`-like object to use
- prune - a string or array of strings of paths to skip (given relative to the root)
- depth - if truthy, then children are yielded before the parent directory

If `depth` is set, then the directory is re-read before it is omitted, as the most
common use case is for removing files
