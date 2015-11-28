[![Build Status](https://travis-ci.org/othiym23/packard.svg)](https://travis-ci.org/othiym23/packard)
[![Coverage Status](https://coveralls.io/repos/othiym23/packard/badge.svg?branch=master)](https://coveralls.io/r/othiym23/packard?branch=master)

# packard

Optimize the storage of media files on fixed-size storage volumes. Currently
supports FLAC files with Vorbis comments.

## usage

```
$ packard
Usage: packard [options] <command>

Commands:
  artists    generate a list of artists from roots
  inspect    dump all the metadata from a track or album
  pls        print a list of albums as a .pls file, sorted by date
  unpack     unpack a set of zipped files into a staging directory

Options:
  -S, --save-config  save this run's configuration to ~/.packardrc [default: false]
  --loglevel         logging level                                 [default: "info"]
  -h, --help         Show help
  --version          Show version number
```

### unpack a set of zip files containing audio files

```
$ packard unpack [zipfile [zipfile...]]
```

example run:

```
$ packard unpack -s ~/Downloads/flac ~/Downloads/flac_SHXCXCHCXSH-STRGTHS.zip --archive
new albums from this run:

/Users/ogd/Downloads/flac/SHXCXCHCXSH/[2013] STRGTHS

full details:

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

now archived:

/Users/ogd/Downloads/flac_SHXCXCHCXSH-STRGTHS.zip
  -> /Users/ogd/Downloads/archives/flac_SHXCXCHCXSH-STRGTHS.zip
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

### generate a .pls version 2 playlist, sorted by release date

```
$ packard [options] pls > playlist.pls
```

example run:

```
$ packard pls -R ~/Downloads/flac2 > ~/Downloads/dark-shadows.pls
WARN artists many dates found [ '2014-10-17', '2014' ]
WARN artists many album names found [ 'Serum' ]
WARN artists many dates found [ '2011-09-12', '2011' ]
WARN artists many album names found [ 'Carrier' ]
info pls Processing /Users/ogd/Downloads/flac2
info pls playlist generated with 275 entries
```

Read one or more directory trees containing media files, and then generate a
chronologically sorted playlist of all of the tracks in those trees, auditing
the files as they go. The playlist is a version 2 .pls file (which includes
track names and durations as well as locations), and will be printed to
standard output (a future version will let you specify the output file, but
redirection works well enough for me for now).

Options:

* `--root`: The root of an `artist/album/tracks` directory tree. This option
  may be used multiple times.

### audit files for inconsistent metadata

```
$ packard audit [file|dir [files|dirs...]]
```

example run:

```
WARN audit Chris & Cosey: Heartbeat / Chris & Cosey - Put Yourself in Los Angeles: has no release month in "1981"
WARN audit Chris & Cosey: Heartbeat / Chris & Cosey - This Is Me: has no release month in "1981"
WARN audit Chris & Cosey: Heartbeat / Chris & Cosey - Voodoo: has no release month in "1981"
WARN audit Chris & Cosey: Heartbeat / Chris & Cosey - Moorby: has no release month in "1981"
WARN audit Chris & Cosey: Heartbeat / Chris & Cosey - Radio Void: has no release month in "1981"
WARN audit Chris & Cosey: Heartbeat / Chris & Cosey - Just Like You: has no release month in "1981"
WARN audit Chris & Cosey: Heartbeat / Chris & Cosey - Bust Stop: has no release month in "1981"
WARN audit Chris & Cosey: Heartbeat / Chris & Cosey - Useless Information: has no release month in "1981"
WARN audit Chris & Cosey: Heartbeat / Chris & Cosey - Moving Still: has no release month in "1981"
WARN audit Chris & Cosey: Heartbeat / Chris & Cosey - Manic Melody (Hairy Beary): has no release month in "1981"
WARN audit Chris & Cosey: Heartbeat / Chris & Cosey - Heartbeat: has no release month in "1981"
WARN audit Chris & Cosey: October (Love Song) / Chris & Cosey - October (Love Song): has no release month in "1982"
WARN audit Chris & Cosey: October (Love Song) / Chris & Cosey - October (Love Song) [12" mix]: has no release month in "1982"
WARN audit Chris & Cosey: October (Love Song) / Chris & Cosey - October (Love Song) [dance mix]: has no release month in "1982"
WARN audit Chris & Cosey: October (Love Song) / Chris & Cosey - Little Houses: has no release month in "1982"
```

Inspect a set of files and / or directories and look for things that I commonly tag incorrectly (or forget to tag altogether):

- dates that aren't in ISO YYYY-MM-DD format
- missing genre tags
- genre tags that aren't included in my personal taxonomy
- Boomkat-style all-caps genre tags

I'll add more validators until the code gets completely unwieldy, at which point I'll convert the validators into configurable plugins and let you choose which validators you want.

### inspect files and display metadata

```
$ packard [options] inspect [file [files...]]
```

example run:

```
$ packard inspect ~/Downloads/flac2/Overlook/\[2014\]\ False\ \ Everything\ Counts/Overlook\ -\ False\ \ Everything\ Counts\ -\ 02\ -\ Everything\ Counts.flac
[
  {
    "path": "/Users/ogd/Downloads/flac2/Overlook/[2014] False  Everything Counts/Overlook - False  Everything Counts - 02 - Everything Counts.flac",
    "metadata": {
      "minBlockSize": 4096,
      "maxBlockSize": 4096,
      "minFrameSize": 16,
      "maxFrameSize": 13001,
      "sampleRate": 44100,
      "channels": 2,
      "bitsPerSample": 16,
      "samplesInStream": 16177333,
      "duration": 366.832947845805,
      "TITLE": "Everything Counts",
      "RELEASECOUNTRY": "XW",
      "TOTALDISCS": "1",
      "LABEL": "Narratives Music",
      "TOTALTRACKS": "2",
      "MUSICBRAINZ_ALBUMARTISTID": "b311f974-4961-4e1d-8065-451d2762497a",
      "DATE": "2014-02-10",
      "DISCNUMBER": "1",
      "TRACKTOTAL": "2",
      "MUSICBRAINZ_RELEASETRACKID": "8c8adb82-8a30-4fd0-a032-9f412866f8ef",
      "ALBUMARTISTSORT": "Overlook",
      "ORIGINALDATE": "2014-02-10",
      "SCRIPT": "Latn",
      "MUSICBRAINZ_ALBUMID": "b8f74ebc-da61-489a-a41f-fa00347d2f7d",
      "RELEASESTATUS": "official",
      "ALBUMARTIST": "Overlook",
      "CATALOGNUMBER": "NARRATIVES007",
      "ALBUM": "False / Everything Counts",
      "MUSICBRAINZ_ARTISTID": "b311f974-4961-4e1d-8065-451d2762497a",
      "MEDIA": "Digital Media",
      "RELEASETYPE": "single",
      "ORIGINALYEAR": "2014",
      "ARTIST": "Overlook",
      "DISCTOTAL": "1",
      "MUSICBRAINZ_RELEASEGROUPID": "344369ca-ffd8-4f79-ad5e-6254fc058d49",
      "MUSICBRAINZ_TRACKID": "0887eedb-ff79-4d60-bbf0-3e2ab616c515",
      "ARTISTSORT": "Overlook",
      "ARTISTS": "Overlook",
      "GENRE": "Drum'n'Bass",
      "TRACKNUMBER": "2",
      "bytesToFirstFrame": 8282
    },
    "stats": {
      "dev": 16777221,
      "mode": 33188,
      "nlink": 1,
      "uid": 501,
      "gid": 20,
      "rdev": 0,
      "blksize": 4096,
      "ino": 37881732,
      "size": 33476216,
      "blocks": 65384,
      "atime": "2015-03-16T02:53:38.000Z",
      "mtime": "2015-03-11T03:36:43.000Z",
      "ctime": "2015-03-11T03:52:57.000Z",
      "birthtime": "2015-03-10T21:19:46.000Z"
    },
    "flacTrack": {
      "artist": "Overlook",
      "album": "False / Everything Counts",
      "name": "Everything Counts",
      "path": "/Users/ogd/Downloads/flac2/Overlook/[2014] False  Everything Counts/Overlook - False  Everything Counts - 02 - Everything Counts.flac",
      "size": 33476216,
      "blockSize": 4096,
      "blocks": 65384,
      "albumArtist": "Overlook",
      "index": 2,
      "disc": 1,
      "date": "2014-02-10",
      "duration": 366.832947845805,
      "ext": ".flac"
    }
  }
]
```

Read the metadata out of one or more audio tracks and dump in a raw, but machine-readable, format all of the metadata generated from that file while `packard` runs. There's a lot of irrelevant detail in here, so it's probable that a more condensed version of this command will come along at some point.

### generate a list of artists

```
$ packard artists
```

example run:

```
$ packard --root=~/Music/flac artists
Basic Channel [1318M]
Demdike Stare [2439M]
Jean Grae [1671M]
Perc [1358M]
Shackleton [2257M]
```

Scan one or more directory trees recursively, printing out a list of the artist
names found, with the sizes of the tracks by that artist, in
[mebibytes](http://en.wikipedia.org/wiki/Mebibyte). This list, in this format,
can be fed into `packard`'s other commands.

Options:

* `--root`: The top level of a directory hierarchy, laid out in
  `root/Artist/Album` format. Can be used more than once.

## shared options

* `--loglevel` (_default: `info`_): `packard` uses `npmlog` (I know it,
  and it has excellent progress bar support). It takes the same log
  levels as npm: `error`, `warn`, `info`, `verbose`, and `silly`. It
  probably takes `http`, but there's no use for that. Yet.
* `--save-config`: Save this run's configuration to `~/.packardrc`.


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
