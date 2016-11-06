[![Build Status](https://travis-ci.org/othiym23/packard.svg)](https://travis-ci.org/othiym23/packard)
[![Coverage Status](https://coveralls.io/repos/othiym23/packard/badge.svg?branch=master)](https://coveralls.io/r/othiym23/packard?branch=master)

# packard

Optimize the storage of media files on fixed-size storage volumes. Currently
supports MPEG 2, layer 3 files with ID3v2 tags (`.mp3` files), FLAC files with
Vorbis comments (`.flac` files), and AAC files in QuickTime containers (`.m4a`
files).

## usage

```
$ packard
Usage: packard [options] <command>

Commands:
  albums [files...]    generate a list of albums from roots
  artists [files...]   generate a list of artists from roots
  audit [files...]     check metadata for inconsistencies
  inspect [files...]   dump all the metadata from a track or album
  optimize [files...]  find the best set of albums to pack a given capacity
  pack                 fill a volume with releases, optimally
  pls                  print a list of albums as a .pls file, sorted by date
  unpack [files...]    unpack a set of zipped files into a staging directory

Options:
  -S, --save-config  save this run's configuration to ~/.packardrc  [boolean] [default: false]
  --loglevel         logging level  [default: "info"]
  -h, --help         Show help  [boolean]
  --version          Show version number  [boolean]
```

## shared options

* `--loglevel` (_default: `info`_): `packard` uses `npmlog` (I know it,
  and it has excellent progress bar support). It takes the same log
  levels as npm: `error`, `warn`, `info`, `verbose`, and `silly`. It
  probably takes `http`, but there's no use for that. Yet.
* `-S` / `--save-config`: Save this run's configuration to `~/.packardrc`.

### pack a volume with audio files

```
$ packard pack --to dest --from src [-R dir [file...]]
```

example run:

```
$ packard pack --to /Volumes/NEWER --from ~/Downloads/flac
packed:
/Volumes/UNSEELIE/flac/Neurosis/[2007-08-15] Live at Roadburn {31414 blocks}
314513 512-byte blocks used on device, 2700817 remaining
```

Fill the volume containing the destination path with as many full releases as
will fit from the target roots. `packard pack` does many things for you,
including figuring out the filesystem allocation size per block on the target
volume, how many blocks are free on the target volume, and what kind of audio
files are in each release. It uses the same knapsack algorithm as `packard
optimize`, and will, if packing files onto the same volume, use hard links
instead of copying files to save space.

For now, it uses a hardcoded naming spec for the written audio files, which
looks like

```
01 - Artist - Album Name - Track Name.format
```

This convention is meant to make it easy to see who performed what, while at
the same time ensuring that simpleminded audio players that use lexical sorting
of track names to determine playback order play compilations correctly.

#### options

* `-R` / `--from`: One or more directory trees in which files to be packed are
  found.
* `-s` / `--to`: The directory root to pack files into.
* `-B` / `--block-size`: `packard` will try to automatically detect the
  blocksize of the destination volume so that it can optimally fill the volume.
  If, for whatever reason, it gets this wrong (say, on Windows, where `df` is
  unavailable), use this option to set the block size explicitly.

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
   01 - SHXCXCHCXSH - STRGTHS - SLVRBBL.flac
   02 - SHXCXCHCXSH - STRGTHS - LTTLWLF.flac
   03 - SHXCXCHCXSH - STRGTHS - RSRRCTN.flac
   04 - SHXCXCHCXSH - STRGTHS - LDWGWTT.flac
   05 - SHXCXCHCXSH - STRGTHS - PCTSTSS.flac
   06 - SHXCXCHCXSH - STRGTHS - WHTLGHT.flac
   07 - SHXCXCHCXSH - STRGTHS - LLDTMPS.flac
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

#### options

* `--staging` / `-s` **required**: The staging directory into which the
  unpacked and renamed files should be placed.
* `--root` / `-R`: The top level of a directory hierarchy containing zip
  files.
* `--pattern` / `-P`: bash glob pattern to join with `root` to find zip files.
  Be sure to single-quote the pattern if you use this option!
* `--archive`: If set, move the unpacked files to `archive-root` after
  extraction.
* `--archive-root`: Where to put zip files after extraction. Files in
  `archive-root` will not be unpacked or moved.

### display how a set of releases would be optimally packed

```
$ packard [options] optimize -O blocks [-R dir [file...]]
```

example run:

```
$ packard optimize -R /Volumes/MUSIQUENONSTOP/latest-flac-3 -R /Volumes/MUSIQUENONSTOP/latest-flac-2 -O 123792896

included:
/Volumes/MUSIQUENONSTOP/latest-flac-2/Various Artists/[2015] Bass and Superstructure Shifting Peaks 2010-2015 [3497796 blocks]
/Volumes/MUSIQUENONSTOP/latest-flac-2/Various Artists/[2015] 20 20 Years of Planet Mu [2820457 blocks]
/Volumes/MUSIQUENONSTOP/latest-flac-3/RAMLEH/Circular Time [2711520 blocks]
/Volumes/MUSIQUENONSTOP/latest-flac-2/Curve/[2010] Rare and Unreleased [2604261 blocks]
/Volumes/MUSIQUENONSTOP/latest-flac-2/Thighpaulsandra/[2015] The Golden Communion [1316502 blocks]
...
/Volumes/MUSIQUENONSTOP/latest-flac-2/Source Direct/[2015-07-13] Approach  Identify (Demdike Stare remix) [150746 blocks]
/Volumes/MUSIQUENONSTOP/latest-flac-2/Paradox/A Certain Sound  Deep Sleep [150414 blocks]
/Volumes/MUSIQUENONSTOP/latest-flac-2/Curve/[1992] Superblaster single [148914 blocks]
/Volumes/MUSIQUENONSTOP/latest-flac-2/Musumeci/[2015] Harry Batasuna  Untitled An-I Edit [148622 blocks]
/Volumes/MUSIQUENONSTOP/latest-flac-2/Fucked Up/[2014] Sun Glass [113248 blocks]
TOTAL: 123784969 512-byte blocks (of 123792896 block capacity)

left out:
/Volumes/MUSIQUENONSTOP/latest-flac-2/Chris  Cosey/[1990] Allotropy [451877 blocks]
/Volumes/MUSIQUENONSTOP/latest-flac-3/Blanck Mass feat Genesis Breyer P-Orridge/[2015-10-26] The Great Confuso EP [426177 blocks]
/Volumes/MUSIQUENONSTOP/latest-flac-3/Circuit Breaker/My Descent Into Capital [391869 blocks]
...
/Volumes/MUSIQUENONSTOP/latest-flac-2/Fucked Up/[2014] Paper The House [99652 blocks]
/Volumes/MUSIQUENONSTOP/latest-flac-2/Fracture/[2015] Luv Ta Luv Ya Fracture VIP [feat DJ Monita] [71639 blocks]
/Volumes/MUSIQUENONSTOP/latest-flac-2/Chris  Cosey/[1991] Passion [56411 blocks]
TOTAL: 9331920 512-byte blocks
```

Given a list of files and tree roots, assemble the tracks into albums and then calculate the optimal packing to fit a given volume size. Fill up your iPhone or memory cards!

#### options

* `--optimal-capacity`: The available blocks on the target device.
* `--block-size`: The size of storage blocks, in bytes, on the target device.
* `--root`: A filesystem root under which there are media files. Can be more than one.

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

#### options

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

### print a list of albums in human-readable format

```
$ packard albums [-R root [file...]]
```

example run:

```
/Volumes/MUSIQUENONSTOP/latest-flac-2/Various Artists/[2015] Bass and Superstructure Shifting Peaks 2010-2015 [1732M]
/Volumes/MUSIQUENONSTOP/latest-flac-2/Various Artists/[2015] 20 20 Years of Planet Mu [1400M]
/Volumes/MUSIQUENONSTOP/latest-flac-3/RAMLEH/Circular Time [1330M]
/Volumes/MUSIQUENONSTOP/latest-flac-2/Curve/[2010] Rare and Unreleased [1294M]
/Volumes/MUSIQUENONSTOP/latest-flac-2/Thighpaulsandra/[2015] The Golden Communion [647M]
/Volumes/MUSIQUENONSTOP/latest-flac-2/Radiohead/[2011] TKOL RMX 1234567 [631M]
/Volumes/MUSIQUENONSTOP/latest-flac-2/Fucked Up/[2011] David Comes To Life [593M]
/Volumes/MUSIQUENONSTOP/latest-flac-3/King Midas Sound  Fennesz/Edition 1 [591M]
/Volumes/MUSIQUENONSTOP/latest-flac-2/Kvelertak/[2010] Kvelertak [584M]
/Volumes/MUSIQUENONSTOP/latest-flac-2/Flying Saucer Attack/Instrumentals 2015 [560M]
/Volumes/MUSIQUENONSTOP/latest-flac-3/Synkro/[2015] Changes [548M]
...
/Volumes/MUSIQUENONSTOP/latest-flac-2/King Midas Sound/[2013] Aroo [54M]
/Volumes/MUSIQUENONSTOP/latest-flac-3/Guy Andrews/[2015-11-13] In Autumn Arms [54M]
/Volumes/MUSIQUENONSTOP/latest-flac-2/Equinox/Paralyze Babylon [52M]
/Volumes/MUSIQUENONSTOP/latest-flac-2/Kerridge/[2015] Sonic Instruments of War [51M]
/Volumes/MUSIQUENONSTOP/latest-flac-2/Fucked Up/[2014] Paper The House [49M]
/Volumes/MUSIQUENONSTOP/latest-flac-2/Fracture/[2015] Luv Ta Luv Ya Fracture VIP [feat DJ Monita] [35M]
/Volumes/MUSIQUENONSTOP/latest-flac-2/Chris  Cosey/[1991] Passion [28M]
TOTAL: 133116889 512-byte blocks
```

Summarize a set of files, assembling the files into logical releases based on their metadata.

#### options

* `-R` / `--root`: The top level of a directory tree. If the tree is
  laid out in `Artist/Album/Track.xxx` format, `packard` will use the
  directory names to fill in missing artist and album metadata.
* Any other arguments passed to the command will be treated as roots or
  individual files.

### generate a list of artists

```
$ packard artists [-R root [file...]]
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

#### options

* `-R` / `--root`: The top level of a directory tree. If the tree is
  laid out in `Artist/Album/Track.xxx` format, `packard` will use the
  directory names to fill in missing artist and album metadata.
* Any other arguments passed to the command will be treated as roots or
  individual files.

## motivation

A while ago, I read about the then-new
[Sony Walkman ZX2](http://www.sony.com/electronics/walkman/nw-zx2). It had just
been announced at the 2015 CES expo, and as someone who's always had a pretty
obsessive relationship with music, it was something that really interested me.
However, the reviews of [its predecessor](http://www.amazon.com/dp/B00FF071I4)
made clear that it didn't really live up to the hype – your money mostly is
paying for a fancy Android skin with a slick display, and the audio components
were no better than what you would find in an iPhone or high-end Android phone.

Poking around on internet forums led me to believe that I could spend an
equivalent amount of money (~US$1K) on a dedicated audio player with
high-quality components that could natively play back high-resolution (24-bit /
96KHz) lossless audio. _Orrrrrrrr_ I could spend under $100 for a
[Sansa Clip Zip](http://www.amazon.com/dp/B005FVNGRS) and a couple
[64GB micro SDXC cards](http://www.amazon.com/dp/B00IVPU7AO) and put
[Rockbox](http://www.rockbox.org/) on it. The Sansa Clip Zip is tiny, it has an
excellent SOC DAC and amplifier that can play back high-resolution FLAC files,
and Rockbox is a powerful software suite and only a little gratuitously weird,
in a Linuxy way. So I did that.

The point of all this was high audio quality in a small package, so of course I
was going to listen to FLACs on it. But FLAC files are big! And I listen to a
lot of different stuff! So I needed a tool that understood what complete
releases looked like, could read the various tagging and audio formats used by
my audio files, and could move releases as units onto a device.

That is what packard is for. Right now it's kind of a grab bag as I assemble
the various pieces of the tool together, but the idea is that eventually it
will be a full-fledged utility for slicing and dicing large audio collections
and managing the interface between those collections and much smaller, portable
devices.
