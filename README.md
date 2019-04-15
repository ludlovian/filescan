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

Returns an async iterable that yields `{ path, stats }` for each file/dir found.

Params can be provided as a string (the start path), or an object with:
- path (mandatory) - the start path
- fs - the `fs`-like object to use
- prune - a string or array of strings of paths to skip (given relative to the root)
