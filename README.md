# packard

Optimize the storage of media files on fixed-size storage volumes.

## usage

```
$ packard --root=~/Music/flac artists
Basic Channel [1318M]
Demdike Stare [2439M]
Jean Grae [1671M]
Perc [1358M]
Shackleton [2257M]
```

### generate a list of artists

```
$ packard artists
```

Scan one or more directory trees recursively, printing out a list of the artist
names found, with the sizes of the tracks by that artist, in
[mebibytes](http://en.wikipedia.org/wiki/Mebibyte). This list, in this format,
can be fed into `packard`'s other commands.

Options:

* `--root` The top level of a directory hierarchy, laid out in
  `root/Artist/Album` format. Can be used more than once.

## MIT License

The MIT License (MIT)

Copyright (c) 2015 Forrest L Norvell <ogd@aoaioxxysz.net>

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
