# packard

Optimize the storage of media files on fixed-size storage volumes.

## usage

```
$ packard unpack -s ~/Downloads/archives ~/Downloads/flac_SHXCXCHCXSH-STRGTHS.zip --archive
SHXCXCHCXSH/[2013] STRGTHS/
   SHXCXCHCXSH - STRGTHS - 01 - SLVRBBL.flac
   SHXCXCHCXSH - STRGTHS - 02 - LTTLWLF.flac
   SHXCXCHCXSH - STRGTHS - 03 - RSRRCTN.flac
   SHXCXCHCXSH - STRGTHS - 04 - LDWGWTT.flac
   SHXCXCHCXSH - STRGTHS - 05 - PCTSTSS.flac
   SHXCXCHCXSH - STRGTHS - 06 - WHTLGHT.flac
   SHXCXCHCXSH - STRGTHS - 07 - LLDTMPS.flac
c: SHXCXCHCXSH/[2013] STRGTHS/cover.jpg
(unpacked to /var/folders/bf/1f70gl7x2_g0s1dchcrw97xm0000gn/T/packard-fecf5c346649efb4/49901c567bc9ae3ba1ffa13358beec2e9e525950)
```

```
$ packard --root=~/Music/flac artists
Basic Channel [1318M]
Demdike Stare [2439M]
Jean Grae [1671M]
Perc [1358M]
Shackleton [2257M]
```

## shared options

* `--loglevel` (_default: `info`_): `packard` uses `npmlog` (I know it,
  and it has excellent progress bar support). It takes the same log
  levels as npm: `error`, `warn`, `info`, `verbose`, and `silly`. It
  probably takes `http`, but there's no use for that. Yet.
* `--save-config`: Save this run's configuration to `~/.packardrc`.

## commands

### unpack a set of zip files containing tracks

```
$ packard unpack [zipfile [zipfile...]]
```

Unpack a set of zipped files containing FLAC files and cover art,
organizing the files into releases and then moving them, along with
their cover art, into a staging directory. You can either pass the list
of files to be expanded as command-line arguments, or use `--root` and
`--pattern` together to have `packard unpac` generate the list of files
you (or you can do both).

If you want to move the files to an archival location after unpacking them,
use `--archive` and set an `--archive-root`.

Options:

* `--staging`, `-s` **required**: The staging directory into which the
  unpacked and renamed files should be placed.
* `--root`, `-R`: The top level of a directory hierarchy containing zip
  files.
* `--pattern`, `-P`: bash glob pattern to join with `root` to find zip files.
  Be sure to single-quote the pattern if you use this option!
* `--archive`: If set, move the unpacked files to `archive-root` after
  extraction.
* `--archive-root`: Where to put zip files after extraction. Files in
  `archive-root` will not be unpacked or moved.

### generate a list of artists

```
$ packard artists
```

Scan one or more directory trees recursively, printing out a list of the artist
names found, with the sizes of the tracks by that artist, in
[mebibytes](http://en.wikipedia.org/wiki/Mebibyte). This list, in this format,
can be fed into `packard`'s other commands.

Options:

* `--root`: The top level of a directory hierarchy, laid out in
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
