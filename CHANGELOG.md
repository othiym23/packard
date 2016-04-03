### 3.2.1 (2016-04-02):

* [`daae751`](https://github.com/othiym23/packard/commit/daae75194567a71e118b1a2f8069d1e85f0b4f6b) `yargs@4` now always includes `--help` and `--version` as options for subcommands. ([@bcoe](https://github.com/bcoe))

#### `packard pack`

* [`8f08595`](https://github.com/othiym23/packard/commit/8f0859591d31d51ce46efec0857f121913bd27fb) Move files when linking them fails on volumes that don't support hard links, and don't overwrite existing files. ([@othiym23](https://github.com/othiym23))
* [`01c351a`](https://github.com/othiym23/packard/commit/01c351af0f20debf8da91363faa0e386bb509ec4) Use the correct capacity when optimizing the list of releases for the volume to be packed. ([@othiym23](https://github.com/othiym23))

### 3.2.0 (2016-01-10):

#### `packard pack`

This command is the whole reason I started writing this tool last February. You give it a set of files and file tree roots, and it assembles all of the found files into albums. Then it figures out the block size and the blocks free on the destination path you point it towards, and then figures how it can most efficiently pack a subset of the albums into the available space on that device. It uses a number of tricks, some of which are probably too tricky for its own good, but I'm using it now, and while it needs refinement, it's pretty much exactly what I hoped it would be. More complete docs are in `README.md`.

* [`f1f4a16`](https://github.com/othiym23/packard/commit/f1f4a1652debb8feeb767e078a1dc20e11fac5b2) `pack`: Add a command to fill a volume with releases, optimally. ([@othiym23](https://github.com/othiym23))
* [`18db393`](https://github.com/othiym23/packard/commit/18db3931aa44865524794ba01a80f627de548663) Calculate the space free on a volume by calling `df` (TBD: figure out how to do this from the CLI on Windows). ([@othiym23](https://github.com/othiym23))

#### `packard audit`

* [`9a2ccea`](https://github.com/othiym23/packard/commit/9a2cceacc8f91c1535ff4e5752d52e7442b899d4) `audit`: Add new genres used in my archive. ([@othiym23](https://github.com/othiym23))
* [`3b1a96f`](https://github.com/othiym23/packard/commit/3b1a96ff5f8d3de2aeaf0fbf21361c710e6b7a92) Add `packard audit` to summary in `README.md`. ([@othiym23](https://github.com/othiym23))

#### `packard optimize`

* [`430c46c`](https://github.com/othiym23/packard/commit/430c46ca04ecc1c71e172c4a4938da0bb0b85680) `optimize`: Use `src/utils/knapsack-albums.js`, just like `packard pack`. ([@othiym23](https://github.com/othiym23))

#### `packard pls`

* [`71c345c`](https://github.com/othiym23/packard/commit/71c345c653539e942258900d57a3cd79ca5982a3) `pls`: Use less stilted language when indicating how many tracks were included in the playlist. ([@othiym23](https://github.com/othiym23))
* [`906c086`](https://github.com/othiym23/packard/commit/906c0862c24b8ffbc6e8a257a0fcff509588c384) `pls`: Explicitly sort by date now that the underlying album-assembly method returns the album list unsorted. ([@othiym23](https://github.com/othiym23))

#### `packard unpack`

* [`2e08f4a`](https://github.com/othiym23/packard/commit/2e08f4a8b364e4bdb9eee74361272a4adb1ff422) `unpack`: Don't report anything when no albums are extracted. ([@othiym23](https://github.com/othiym23))

#### simplify how file scanning works and fix the progress bar

* [`d794bab`](https://github.com/othiym23/packard/commit/d794bab732caad7ca2e768c28e2af6a54f75a83e) `src/flatten-tracks.js` doesn't need to exist, and DRY up the rest of filesystem scanning a bit. ([@othiym23](https://github.com/othiym23))
* [`4cd9f7b`](https://github.com/othiym23/packard/commit/4cd9f7b511a9b4ee16594e1c3e97161b1baac5d8) Merge `src/read-fs-{artists,albums,tracks}.js` into `src/read-fs-artists.js`. This is the first step towards completely revamping how `packard` builds up the list of files to scan, as well as centralizing cruft handling in a more useful way. ([@othiym23](https://github.com/othiym23))
* [`48416fa`](https://github.com/othiym23/packard/commit/48416fa2f174c8125ae1dbe50fc12d6b1c3632b1) Simplify path list generation. Not wired in, but a lot simpler than `src/read-fs-artists.js`, even as it reuses a lot of the same code. ([@othiym23](https://github.com/othiym23))

#### clean up Promise usage

* [`af1d92f`](https://github.com/othiym23/packard/commit/af1d92f94f929913dddee3ddc7748b16698033c7) Merge `src/albums.js` into `src/command/albums.js`, and simplify how Promises are used. Extract sort functions into `src/utils/sort.js`. ([@othiym23](https://github.com/othiym23))
* [`12b3dea`](https://github.com/othiym23/packard/commit/12b3deac4a3de1bdc2690a64ea2cdb8dc1f58f74) Simplify code by simplifying how Promises are used. Also, new versions of `tap` allow you to return Promises inside tests, and `tap` will figure out what to do with them. ([@othiym23](https://github.com/othiym23))
* [`a760fee`](https://github.com/othiym23/packard/commit/a760fee14ab462ea3f6f48bbf1dd38da30ab7fd0) Bluebird has `.mapSeries`. Use it to call out operations that need to remain serialized. ([@othiym23](https://github.com/othiym23))

#### improve metadata testing

* [`d89c170`](https://github.com/othiym23/packard/commit/d89c17031fb47b9bdb38473b9d1a3c1dbf0d344a) Simplify the tag reader interface by eliminating the need for "extras". ([@othiym23](https://github.com/othiym23))
* [`916aa85`](https://github.com/othiym23/packard/commit/916aa8549bd99a628609d8becba8b2ed8b02a2fa) Test tag readers to make sure they don't crash when audio files don't contain tags. ([@othiym23](https://github.com/othiym23))
* [`63f88a6`](https://github.com/othiym23/packard/commit/63f88a6ca7e95fed05e264d627dde102e703eda8) Add yet more frame / atom / field types found in tags in the wild. ([@othiym23](https://github.com/othiym23))
* [`59e63c0`](https://github.com/othiym23/packard/commit/59e63c0bffc53f62f61ffa72b9aabb9a36d5ffb3) Add ID3v2 writing that's good enough for writing tests for ID3v2 reading. Include `CONTRIBUTING.md` so people can see that they need to install [`eyeD3`](http://eyed3.nicfit.net/) in order to run the tests that write tags to MP3 files (sorry about that, but nothing available for Node.js is up to the job, and I don't have the time to port my own library right now). Also, `eyeD3` is very nice. ([@othiym23](https://github.com/othiym23))
* [`53776aa`](https://github.com/othiym23/packard/commit/53776aacb288d8aa02a590b9bdfbc504e2d1f2f6) Sometimes I'm not so good about making sure that different tests don't reuse directories. ([@othiym23](https://github.com/othiym23))
* [`0988c3c`](https://github.com/othiym23/packard/commit/0988c3cec4bf896ecd4808a14371008bbe2e2e0f) Make the FLAC tag reading tests roughly equivalent to the MP3 tests. ([@othiym23](https://github.com/othiym23))
* [`4edb01a`](https://github.com/othiym23/packard/commit/4edb01ade6d251ac637717b06d4c129e68d9ebd7) Add QuickTime atom writing that's good enough for writing tests for `.m4a` file reading. This time you have to install [AtomicParsley](http://atomicparsley.sourceforge.net/), which is a C++ program, but still the only thing out there that's trustworthy for writing tags that are interoperable with iTunes. At least both `eyeD3` and AtomicParsley run on Windows (I think). ([@othiym23](https://github.com/othiym23))
* [`c063a00`](https://github.com/othiym23/packard/commit/c063a001acf7f88d5980e0c23ff5df8c61b1d49a) Put the right releases in the right directories, so that it's easier to understand the output. ([@othiym23](https://github.com/othiym23))

#### The FLAC metadata writing saga

There's a long and convoluted story behind this:

Problem: about 1 out of every 4 test runs, the unpack tests would fail due to finding the wrong number of albums in a zipfile. The albums are assembled from metadata, and the extra album would have all the default values from the names, indicating that the FLAC metadata wasn't being set on the extracted tracks.

Hypothesis: in failing cases, the FLAC reader is getting only part of a chunk and is terminating early because it gets a finish event before it's finished looking at chunks. (Or at least this is what I spent several hours thinking.)

```
          / parserGauge - parser
zipStream
          \ writeGauge - extracted

          / Through - Tokenizr
fd_slicer
          \ Through - fs.WritableStream
```

- stream events are the same on failing and succeeding reads
- nothing unusual happening in the stream buffering (checked with stream)
- see what's getting written to the FLAC parser by monkeypatching `parser.write`:

on success:
```
002 - 01 FLACParser 8390
002 - 02 FLACParser 8390
005 - 01 FLACParser 8386
005 - 02 FLACParser 8383
```

on failure:
```
002 - 01 FLACParser 8282
002 - 02 FLACParser 8390
005 - 01 FLACParser 8386
005 - 02 FLACParser 8282
```

- from this, it looks like the zipstream isn't sending all the chunks to the FLAC parser.
- see if all the chunks are getting written to the output files by monkeypatching `extracted.write`:

on success:
```
002 - 01 extracted 8390 FLACParser 8390
002 - 02 extracted 8390 FLACParser 8390
005 - 01 extracted 8386 FLACParser 8386
005 - 02 extracted 8383 FLACParser 8383
```

on failure:
```
002 - 01 extracted 8282 FLACParser 8282
002 - 02 extracted 8390 FLACParser 8390
005 - 01 extracted 8386 FLACParser 8386
005 - 02 extracted 8383 FLACParser 8383
```

- because there aren't any errors, and the length of the failed files is the same as `empty.flac`, it looks like the test code that writes the FLAC tags is incorrect, which is both reassuring and super irritating.

CONCLUSION: The reading code was fine, but there was a race condition in the code that populated stub FLAC tracks with metadata. Once that was fixed, the problem went away.

* [`17a8787`](https://github.com/othiym23/packard/commit/17a878737047026cf051ab0a09cb69a28ed9489a) Fix FLAC metadata writing race, part 1. ([@othiym23](https://github.com/othiym23))
* [`091ef34`](https://github.com/othiym23/packard/commit/091ef341e4760f6af80608b68d44309fc75bb5da) Fix FLAC metadata writing race, part 2. `flac-metadata` cannot deal with concurrency _at all_. ([@othiym23](https://github.com/othiym23))
* [`39e58d2`](https://github.com/othiym23/packard/commit/39e58d21c56037dc00469eb53460b0396113b7c1) Write a script to stress-test packing and unpacking audio-file archives. ([@othiym23](https://github.com/othiym23))

#### tweaks

* [`0273dee`](https://github.com/othiym23/packard/commit/0273deed2622cf513a6b8c3621f5657c6ba96fd7) Explain why I've put so much time into this tool. ([@othiym23](https://github.com/othiym23))
* [`d3ce767`](https://github.com/othiym23/packard/commit/d3ce767b91a19150d374c23ce10601bd7e0834b1) Update `TODOS.md`. ([@othiym23](https://github.com/othiym23))
* [`b24470c`](https://github.com/othiym23/packard/commit/b24470c0c2455b7518aeaaa9bb68b276a4856181) `TODO.md` needed some cleanup. ([@othiym23](https://github.com/othiym23))
* [`46d23e1`](https://github.com/othiym23/packard/commit/46d23e17a5919b7dc3e02db491229f10f0a8b0f9) Fix typos in `CONTRIBUTING.md` ([@othiym23](https://github.com/othiym23))
* [`6d46b61`](https://github.com/othiym23/packard/commit/6d46b61bded44668616fde91d440349c356ddd13) Refactor zipfile unpacking for comprehensibility, including testing it a bunch more. ([@othiym23](https://github.com/othiym23))
* [`b93299b`](https://github.com/othiym23/packard/commit/b93299ba12e49d9fa5ed48f077fe8242a5f860c1) Further clarify the zipfile unpacking code, including adding more useful logging. ([@othiym23](https://github.com/othiym23))
* [`6a5fff3`](https://github.com/othiym23/packard/commit/6a5fff328311a8ac4aa138cced27f94362d2b56d) Update to `@packard/model@3.0.1`, which uses a less draconian strategy for sanitizing file and directory names. ([@othiym23](https://github.com/othiym23))
* [`4d238a1`](https://github.com/othiym23/packard/commit/4d238a17289389621be7c74f50729f540f243fee) `yauzl` will occasionally emit a zipfile entry or two when `Bluebird.promisify` is running the dezalgoed `yauzl.open`, which says bad things about `yauzl` _and_ the V8 microtask queue, simultaneously. ([@othiym23](https://github.com/othiym23))
* [`cf18f6a`](https://github.com/othiym23/packard/commit/cf18f6af351cdcdf2cd1278b51c72d560369197f) Use `Set.prototype.size` instead of relying on casting being present at runtime (because it won't be when running tests in older versions of Node.js). ([@othiym23](https://github.com/othiym23))
* [`1778724`](https://github.com/othiym23/packard/commit/17787245e0e07f22ffce8a2140d1c8ffd7213e1d) Added logging. ([@othiym23](https://github.com/othiym23))
* [`4fe1003`](https://github.com/othiym23/packard/commit/4fe1003c169c23c38f9c087dee6873e7453aa276) Remove closures when calling `untildify` – they're unnecessary. ([@othiym23](https://github.com/othiym23))
* [`bb0e1a6`](https://github.com/othiym23/packard/commit/bb0e1a6dd90c5c8fb2d025b72b0d4b9ca0f80e0c) Tell `yargs` to read config values from the environment with a `PACKARD_` prefix. ([@othiym23](https://github.com/othiym23))
* [`31391c3`](https://github.com/othiym23/packard/commit/31391c3b744daa3159ac57d081c272e2b697acbc) Log cover images found when assembling albums. ([@othiym23](https://github.com/othiym23))

#### Travis

* [`1ded5c1`](https://github.com/othiym23/packard/commit/1ded5c1bd95b35a9ae6eed22f86ce6b053c6b104) Tell Travis to use g++ 4.8 when building native modules for newer versions of Node.js and nan. ([@othiym23](https://github.com/othiym23))
* [`536c29b`](https://github.com/othiym23/packard/commit/536c29bed6435a57be2a5d0785bed1b083181fb8) Maybe I need to set the compiler version before install time? ([@othiym23](https://github.com/othiym23))
* [`9847521`](https://github.com/othiym23/packard/commit/9847521fe6879c8eea17d17eec92f48dd9c8ea90) The Travis docs tell me I should try using clang. ([@othiym23](https://github.com/othiym23))
* [`6717823`](https://github.com/othiym23/packard/commit/67178235ca4b3ed3f5d83165898a011213b2e650) It seems that clang is problematic. Use g++ for sure. ([@othiym23](https://github.com/othiym23))
* [`e2bced5`](https://github.com/othiym23/packard/commit/e2bced50e770a699a8a659ea52350ed4c665df4a) Temporarily opt out of Travis containerization so that the tests can use sudo to install `eyeD3` and AtomicParsley. ([@othiym23](https://github.com/othiym23))
* [`db6bed1`](https://github.com/othiym23/packard/commit/db6bed18e1cd939122f9f7b82361c97b6b01587d) `eyeD3` 0.6, the version installed by Ubuntu Precise, doesn't support the `--quiet` option. ([@othiym23](https://github.com/othiym23))
* [`eb441a3`](https://github.com/othiym23/packard/commit/eb441a3b07bc579a2e8648fbabc7f313237127b1) Support both 0.6 and 0.7 of eyeD3 to unblock Travis. ([@othiym23](https://github.com/othiym23))
* [`f108765`](https://github.com/othiym23/packard/commit/f108765ca4a0159219b958da81dfcf23b0d28512) Find a more robust way to get the eyeD3 version so that both Travis and my dev environment can be happy at the same time. ([@othiym23](https://github.com/othiym23))
* [`b8f6bb6`](https://github.com/othiym23/packard/commit/b8f6bb60543eaf8e76c7b12fd7d249329ded4c90) Travis added `eyeD3` and AtomicParsley to their package whitelist, so I don't need to use sudo to install them anymore. Yay for containerized builds! ([@othiym23](https://github.com/othiym23))
* [`6147ac4`](https://github.com/othiym23/packard/commit/6147ac4c5f594d0c1ade9319c1eebf9705097012) Linux `df` fails differently than Darwin's. ([@othiym23](https://github.com/othiym23))
* [`e2ab948`](https://github.com/othiym23/packard/commit/e2ab94860a470efaf052a889d46ba4b6893eaed8) Notify Slack when a Travis build finishes. ([@othiym23](https://github.com/othiym23))

#### build

* [`f9b599c`](https://github.com/othiym23/packard/commit/f9b599c43e170a7865b1ba10a7686914a82a82e0) Fix `package.json` to point to the current main entry point. ([@othiym23](https://github.com/othiym23))
* [`1ce65bc`](https://github.com/othiym23/packard/commit/1ce65bc6d0058cd6f9f8c5767aac3b25c74f8e0b) `Buffer.prototype.indexOf` was only added in Node.js 5, so depend on `buffertools` to get that functionality in older Nodes. ([@othiym23](https://github.com/othiym23))
* [`d74525c`](https://github.com/othiym23/packard/commit/d74525ccf63f2de7adcaf08bbc420e609f8da563) Configure babel to emit sourcemaps when transpiling, which [`nyc`](http://npm.im/nyc) will use to transparently map back to the ES6 code for coverage measurement. So cool! ([@othiym23](https://github.com/othiym23))
* [`d65ece2`](https://github.com/othiym23/packard/commit/d65ece2c9f18b226d30c1b6cc6d2fecc81eeafa0) Babel grinds on: update dependencies. ([@othiym23](https://github.com/othiym23))
* [`c7be511`](https://github.com/othiym23/packard/commit/c7be511aa47c6f91553918ff23181580e2c27dc8) Update to latest `tap`. ([@othiym23](https://github.com/othiym23))
* [`6017cc8`](https://github.com/othiym23/packard/commit/6017cc8358e00ada7ca7178043bcd5c7e8671e51) Update dependencies. ([@othiym23](https://github.com/othiym23))

### v3.1.0 (2015-11-30):

#### more metadata!

It was always my plan to add support for MP3 and AAC files to `packard`, it's just that for DJing and listening, I've been buying nothing but FLAC files (or buying WAVs that I then transcode to FLAC before archiving them – thanks, Beatport!). It turns out the state of the art as far as tag reading isn't quite where I'd like it to be, but with some creative hacking, I was able to get the streaming ID3v2 frame and QuickTime atom parsers I needed to make this happen.

In principle, `packard` should now be agnostic to audio file types, and adding additional file types, should someone want to (MQA? ALAC? Monkey's Audio? shn?), should be easy at this point, assuming a streaming parser for the tag frames exist in the npm ecosystem. At some point, I'd like to add the ability to clean up tags, but that's a little stickier, given how complicated writing the different kinds of tags are.

* [`c68c35b`](https://github.com/othiym23/packard/commit/c68c35b87028f16eb7277c669ee5ec92219026aa) ID3v2 frames: use [`musicmetadata`](http://npm.im/musicmetadata) to read tags from MP3 files, and create an abstract tag reader function that maps file types to specific kind of tag reader needed. ([@othiym23](https://github.com/othiym23))
* [`0637077`](https://github.com/othiym23/packard/commit/063707720025debf6ac892c78ed81bcdd0b78ab3) QuickTime atoms: use [`mp4-parser`](http://npm.im/mp4-parser) to read tags from AAC files, and plug it into the abstract tag reader. `mp4-parser` assumes that everything's UTF-8, so fix up the standard iTunes atom names (which are encoded in... something else) using hax. ([@othiym23](https://github.com/othiym23))
* [`460018f`](https://github.com/othiym23/packard/commit/460018f0de2a8683b91ac5886d87971e4888b4ae) `src/flac/*` → `src/metadata/flac/*`. ([@othiym23](https://github.com/othiym23))
* [`5525f51`](https://github.com/othiym23/packard/commit/5525f5102027bb5af77390a7318b948e2b4064f6) `src/mp3/*` → `src/metadata/mp3/*`. ([@othiym23](https://github.com/othiym23))
* [`56a1956`](https://github.com/othiym23/packard/commit/56a19568ed00024f82655945fbf8abf333919821) Add ability to extract `.m4a` files and scan them for metadata from zipfiles. ([@othiym23](https://github.com/othiym23))
* [`664c6c4`](https://github.com/othiym23/packard/commit/664c6c4c1a1f6fe537f4a4cb4deff2e23f9cc966) Extract iTunes helpers from `.m4a` reader. ([@othiym23](https://github.com/othiym23))
* [`9910efd`](https://github.com/othiym23/packard/commit/9910efdba5c5a0d018a3818b42f035c95e23e751) Rename functions to reflect that `packard` can handle MP3 and AAC files as well as FLAC files now. ([@othiym23](https://github.com/othiym23))
* [`8033d16`](https://github.com/othiym23/packard/commit/8033d161348a8c81b977c86379dfb4f21c784f5d) Extract tag internal-name-to-packard-name mappings from metadata readers. ([@othiym23](https://github.com/othiym23))
* [`fcc9444`](https://github.com/othiym23/packard/commit/fcc9444cf039d102cc062c9854edd41e6f2f6047) Improve ID3v2 tag reading by incorporating more frame types and simplifying how mappings are used. ([@othiym23](https://github.com/othiym23))
* [`27ee550`](https://github.com/othiym23/packard/commit/27ee5503b4804a9084f254e751565454098b6ccb) Update to `@packard/model@3`, which uses `tags` instead of `flacTags`. ([@othiym23](https://github.com/othiym23))
* [`8da151e`](https://github.com/othiym23/packard/commit/8da151e83ff817beca7c5ade4d14a37ac52c5347) Add more tag types based on what's out there in the wild. ([@othiym23](https://github.com/othiym23))
* [`b44f31c`](https://github.com/othiym23/packard/commit/b44f31c4370996ced4c6819726e665afa11d92ce) Warn when a metadata reader encounters an unfamiliar tag type – that's the quickest way to ensure that the unknown tag type gets incorporated into the tag-reading framework. ([@othiym23](https://github.com/othiym23))

#### tweaks

* [`180470d`](https://github.com/othiym23/packard/commit/180470d64fcf259fff32a14a2aff55b07e7ec48d) Burn the boats! Commit to standard! Which I already did! But I forgot to delete `.eslintrc`! ([@othiym23](https://github.com/othiym23))
* [`5638219`](https://github.com/othiym23/packard/commit/5638219f84f99a63913736ee76bd341ad56eeb5d) `albums` and `optimize` were missing from the command-line summary included in `README.md` and `test/cli-basic.js`. ([@othiym23](https://github.com/othiym23))
* [`fc9c697`](https://github.com/othiym23/packard/commit/fc9c697bed738906673f210c0bf760b5b0a11047) Use files and file tree roots consistently across `packard` commands. ([@othiym23](https://github.com/othiym23))
* [`f7855df`](https://github.com/othiym23/packard/commit/f7855dfc1f13b906f4a7da43183c79bfd527acc9) Hack around issue with single-track albums as a way of stalling until proper cuesheet parsing can be added. ([@othiym23](https://github.com/othiym23))

### v3.0.0 (2015-11-29):

#### BREAKING

* [`ad096b6`](https://github.com/othiym23/packard/commit/ad096b6fedf610c895c872acddd7c761c772e25f) Extract options into `config/options.js` and `config/default.js`. In the process, noticed that the `-S` option was defined twice. One of them had to be remapped, so `packard optimize -S` (aka `--block-size`) got changed to `-B`. Because this is a breaking change to how the CLI is invoked, this version bump must be semver-major. ([@othiym23](https://github.com/othiym23))
* [`593c1bf`](https://github.com/othiym23/packard/commit/593c1bf001ff300cc3dc7fb32b0e2b9a3344eddb) Fix two small bugs in `packard optimize` option handling. ([@othiym23](https://github.com/othiym23))

#### CLI scaffolding redesign

* [`ef2eb03`](https://github.com/othiym23/packard/commit/ef2eb03b12e24b9046baeec9f95c9db4ea9bf0bc) `src/show-albums.js` → `src/commands/albums.js`. ([@othiym23](https://github.com/othiym23))
* [`eedafe6`](https://github.com/othiym23/packard/commit/eedafe681cfe3435639d3b723a7317a4acd337a4) `artists`: Move into `src/command/artists.js`, with report. ([@othiym23](https://github.com/othiym23))
* [`23cb54b`](https://github.com/othiym23/packard/commit/23cb54be4ed30e0c639cc5ec6ce303c60d5e31ae) `audit`: Move into `src/command/audit.js`, with report. ([@othiym23](https://github.com/othiym23))
* [`0e4b58f`](https://github.com/othiym23/packard/commit/0e4b58fb06f9e612b56bbaedd94a8d9e4f5189bd) `inspect`: Move into `src/command/inspect.js`. ([@othiym23](https://github.com/othiym23))
* [`b684ffc`](https://github.com/othiym23/packard/commit/b684ffc3bf53ee97627aab9f399b07a9f8a1b98e) Move `pls` and `unpack` into `src/command`, finishing the process of extracting commands from `src/cli.js`. ([@othiym23](https://github.com/othiym23))
* [`defa12e`](https://github.com/othiym23/packard/commit/defa12e8818623bc740741157a1992e4a7596f38) `artists`: Move progress bar setup from CLI scaffold into command. ([@othiym23](https://github.com/othiym23))
* [`3133845`](https://github.com/othiym23/packard/commit/313384581836d6895caa66c0cadfa201b1fc5f6b) Incorporate `src/metadata/index.js` back in to `src/command/unpack.js`. The resulting module is huge and unwieldy, but it's no longer experiencing feature envy. ([@othiym23](https://github.com/othiym23))
* [`58ec294`](https://github.com/othiym23/packard/commit/58ec29408ad52d12aed6064586b11629902e22dc) Include `src/flac/scan.js` into `src/command/unpack.js`, because it was largely redundant already. ([@othiym23](https://github.com/othiym23))

#### cleaning up configuration

* [`bcd0d65`](https://github.com/othiym23/packard/commit/bcd0d6583e0ba0b8ccee9415510e6c1e8ab8e210) Extract `saveConfig` into `src/config/save.js`. ([@othiym23](https://github.com/othiym23))
* [`f0c6908`](https://github.com/othiym23/packard/commit/f0c690815987284a328a238a349ba66000022fa6) Move log configuration to `src/config/default.js` ([@othiym23](https://github.com/othiym23))
* [`26fd9cb`](https://github.com/othiym23/packard/commit/26fd9cb2ec8f7fc1795b83dbaf055ad828e244cf) Add top-level trapping of errors in commands, as well as centralized logic to make it so that every command can use `--save-config`. ([@othiym23](https://github.com/othiym23))
* [`32083e8`](https://github.com/othiym23/packard/commit/32083e87a9b8dca88e38c9081b01fd0fcd1f5904) Make option handling shorter. ([@othiym23](https://github.com/othiym23))
* [`243f0c7`](https://github.com/othiym23/packard/commit/243f0c78f67a103668c81264b74ee68520677393) Make option handling tidier. ([@othiym23](https://github.com/othiym23))

#### tweaks

* [`1979af4`](https://github.com/othiym23/packard/commit/1979af4e0599450eee7841547441b53a28bc62d9) `albums`: Untildify each root. ([@othiym23](https://github.com/othiym23))
* [`e0359a0`](https://github.com/othiym23/packard/commit/e0359a0fc71d5dc23bb1b8f82aa2914144f90aa6) Always disable the progress bar on error. ([@othiym23](https://github.com/othiym23))
* [`ecd3aca`](https://github.com/othiym23/packard/commit/ecd3acac06efe6b44b2b02929ca65e89597b7b16) Hoist `are-we-there-yet` debugging so that it's logged for every command. ([@othiym23](https://github.com/othiym23))
* [`cecc395`](https://github.com/othiym23/packard/commit/cecc395b59f830f434354d3258f36709d6d5db5b) A first step towards simplifying progress group handling. It's going to take a few more. ([@othiym23](https://github.com/othiym23))
* [`0f98607`](https://github.com/othiym23/packard/commit/0f98607179218035c58a4c1af1628de2452c8c21) When printing out banner when there are no files for `packard unpack` to process, disable the progress bar first, so the message doesn't get overwritten. ([@othiym23](https://github.com/othiym23))
* [`2d9ffcf`](https://github.com/othiym23/packard/commit/2d9ffcf9e04a7fb50fa23d2b4bf66b8414408e59) Handle video files in zipfiles, and just treat them like Files for now. ([@othiym23](https://github.com/othiym23))
* [`e691b54`](https://github.com/othiym23/packard/commit/e691b5485133bf9b7b51ab9f9ba4f251ac71e72a) Share the set of cruft names between the filesystem and zipfile scanners. ([@othiym23](https://github.com/othiym23))

#### build

* [`b328af3`](https://github.com/othiym23/packard/commit/b328af3f2ac94ea2fb48cbf32a32e806ecb6f259) Include `babel-polyfill` at the top level to keep Node.js 0.10 happy. ([@othiym23](https://github.com/othiym23))
* [`373399f`](https://github.com/othiym23/packard/commit/373399f2243929ea2d37aab626de3d26082145c0) Remove `lib/` before transpiling to clear out dead code. ([@othiym23](https://github.com/othiym23))
* [`c2105e4`](https://github.com/othiym23/packard/commit/c2105e413faabfa88923eac0387c165662e2b5fc) `cruft` is a Set, so use a polyfill for Node 0.10. ([@othiym23](https://github.com/othiym23))

### v2.4.0 (2015-11-28):

#### `packard optimize`

Ohhhh gooddddd it's gettting so clooose! `packard optimize` is the last piece before being able to write `packard pack` – it takes a given set of directories and files, reads the metadata of the contained audio files, assembles them into albums, calculates the sizes of the albums, and then runs them through a knapsack optimization to fill the most of a specified space (with provided allocation block size) with complete releases.

* [`e6d4cae`](https://github.com/othiym23/packard/commit/e6d4caeeb13ba8230dedbc5c7f560f906ffe29ee) `optimize`: Figure out how many releases will fit into a given capacity. ([@othiym23](https://github.com/othiym23))

#### `packard albums`

`packard albums` is the next small step towards being able to have the workflow described in the release notes for `packard@2.0.0-0`, below. For now, it just prints a path to a folder containing an album, along with its size in blocks. I haven't really figured out how to deal with albums that are split across multiple directories (i.e. multi-disc sets), but I'm working on it.

* [`1f85093`](https://github.com/othiym23/packard/commit/1f85093b8e4a669dbd6bff0054567be838480c62) `albums`: Add command to assemble albums from audio file trees and then summarize the albums, with sizes. ([@othiym23](https://github.com/othiym23))
* [`58e3783`](https://github.com/othiym23/packard/commit/58e37833ab05b86b3158129af2b8109a5493e389) Tweak output of `packard albums` to include only one line per album, and append total blocks used by the whole set. ([@othiym23](https://github.com/othiym23))

#### tweaks

* [`e404140`](https://github.com/othiym23/packard/commit/e404140c4f710dde6c608a94fccfa16ba5885cee) Clean up command-line option handling. Add functional tests for all of the top-level commands. ([@othiym23](https://github.com/othiym23))
* [`c371f02`](https://github.com/othiym23/packard/commit/c371f0268fa60d8191fbdcb74b5019a1fff46135) Get off the happy path in tests to improve useful coverage. ([@othiym23](https://github.com/othiym23))
* [`ac8f6c1`](https://github.com/othiym23/packard/commit/ac8f6c1346fff977b0fea88b374b6a222c0739c5) Split `LICENSE` out of `README`. ([@othiym23](https://github.com/othiym23))

### v2.3.0 (2015-11-27):

#### `packard audit`

I'm super thingy about metadata quality. Almost all of my music has been tagged using [Picard](https://picard.musicbrainz.org/) to ensure that all of the stuff I'm listening to is in [Musicbrainz](https://musicbrainz.org/), I try to make sure I'm using (my own) standard vocabulary of musical subgenres, I'm picky about how remixes are offset in track names (square brackets not round, plz) – there's a ton of this stuff I care about, and I'm constantly dropping the ball when trying to finalize releases before putting them in my archive. This is the first spike towards automating metadata auditing in `packard` (a previous version of my audio file management tools did all this, but it also had a bug that caused it to corrupt ID3v2 tags, so this version just flags problem files and lets you fix them with a metadata editor you trust).

* [`49f3c78`](https://github.com/othiym23/packard/commit/49f3c7891817f22ba99e1235b4b33b82fb6269fc) `audit`: Add a command to run metadata quality checks against both releases and tracks. ([@othiym23](https://github.com/othiym23))

#### tweaks

* [`bfeddf9`](https://github.com/othiym23/packard/commit/bfeddf994d4b444a08faa26941f3d807a6aa608e) Assemble albums across filesystem trees. ([@othiym23](https://github.com/othiym23))
* [`d579c51`](https://github.com/othiym23/packard/commit/d579c51d69610a5d38459ea22093e29f40fcc1c0) Where possible, treat trees and files as interchangeable when generating lists of files to scan. ([@othiym23](https://github.com/othiym23))
* [`dd27660`](https://github.com/othiym23/packard/commit/dd27660d466883f52a256a75b7b6e79e2a55fb4b) Add logging. ([@othiym23](https://github.com/othiym23))

#### build

* [`7c45025`](https://github.com/othiym23/packard/commit/7c45025efaf62a33cdf9730793a34eea7f97e1ab) Add Node.js 5 to Travis build matrix. ([@othiym23](https://github.com/othiym23))
* [`b6ea310`](https://github.com/othiym23/packard/commit/b6ea310eca714cebc0303262600a429e7f5fdb6d) Update `standard` and `tap`. ([@othiym23](https://github.com/othiym23))

### v2.2.2 (2015-11-16):

* [`8825d2c`](https://github.com/othiym23/packard/commit/8825d2cb2060e49acdbcf8dcc92aa0acd0798eb7) Because `yauzl` and the FLAC metadata reader are both streaming, combine extracting an audio file from a zipfile with scanning it for FLAC metadata, saving a whole bunch of time. ([@othiym23](https://github.com/othiym23))
* [`fbf6519`](https://github.com/othiym23/packard/commit/fbf65199cb41a2dda27c6a8b1347914497fc510f) Be more robust in the face of missing tag metadata. ([@othiym23](https://github.com/othiym23))
* [`b4aba56`](https://github.com/othiym23/packard/commit/b4aba563d89d3ca29a3d7c294ddf3982b60ebddb) Instead of grouping tracks by artist and album, which does bad things to compilations, group either by the album artist and album, or by the containing directory. ([@othiym23](https://github.com/othiym23))
* [`8d66885`](https://github.com/othiym23/packard/commit/8d66885b645b79662bb82fb1407a9a1c559ffd64) Warn instead of throwing when there are files left over after assembling albums. ([@othiym23](https://github.com/othiym23))
* [`7ad684c`](https://github.com/othiym23/packard/commit/7ad684c867b90ec22a0f902f8c18cc7faa73d3e2) Update dependencies to latest, including handling the `babel@6` apocalypse and switching from `babel/polyfill` to `babel-polyfill`. ([@othiym23](https://github.com/othiym23))
* [`f816b88`](https://github.com/othiym23/packard/commit/f816b884724846514cc7e5729d783337f0deb39e) To reduce ambiguity, `Promise` → `Bluebird`. ([@othiym23](https://github.com/othiym23))
* [`1be9878`](https://github.com/othiym23/packard/commit/1be9878a44f4c222faefd929c1a8783bdae6a964) When sorting by (potentially partial) ISO date strings, use [`moment`](http://npm.im/moment) with explicit templates, because it gets bitter otherwise. ([@othiym23](https://github.com/othiym23))
* [`0f895f2`](https://github.com/othiym23/packard/commit/0f895f2418009ba44c157fec9edba7932b30a835) `src/utils/zip.js` wasn't using `graceful-fs` ([@othiym23](https://github.com/othiym23))
* [`209909e`](https://github.com/othiym23/packard/commit/209909e08ad4cc1b1acf1ae280777fc87f7ba6e0) Only when there are covers to be copied will the progress tracker track cover copying. Satisfyingly tautological. ([@othiym23](https://github.com/othiym23))
* [`fa52134`](https://github.com/othiym23/packard/commit/fa52134a1c9d20ca6adbfdbe0edc434e27298a59) Dump [`are-we-there-yet`](http://npm.im/are-we-there-yet) state at the end of commands. ([@othiym23](https://github.com/othiym23))

### v2.2.1 (2015-09-20):

#### where the hell am I going with all this?

* [`44a7ebf`](https://github.com/othiym23/packard/commit/44a7ebf38485fe47cbe98084477e700db5645b4c) Create `TODO.md`. ([@othiym23](https://github.com/othiym23))
* [`890531c`](https://github.com/othiym23/packard/commit/890531ca58bfdd86fce5076dd0bbd83e0cd1dc26) I use [FoldingText](http://www.foldingtext.com/) to manage `TODO.md`, and it has weird whitespace requirements. ([@othiym23](https://github.com/othiym23))
* [`d695e1c`](https://github.com/othiym23/packard/commit/d695e1c2d4c9c6f0ecd6c2cdc36476c126918e6e) Mark some tasks finished in `TODO.md`. ([@othiym23](https://github.com/othiym23))

#### fleshing out the (meta)data model

* [`4311bcc`](https://github.com/othiym23/packard/commit/4311bcced1042fac169967abbd10edd2684faf45) Add a File model to wrap stats and paths. ([@othiym23](https://github.com/othiym23))
* [`05d6b53`](https://github.com/othiym23/packard/commit/05d6b5343f08c55959e98dac2f6d359458202b2c) Track inherits from File, and `Track.fromFLAC` now sets more Track values based on FLAC tags. ([@othiym23](https://github.com/othiym23))
* [`00f9ce9`](https://github.com/othiym23/packard/commit/00f9ce990169a9bcc383b4da60531dc4682ba22a) Tracks have a File, instead of being a file. (Sometimes Track data will come along without being tied to a physical file.) ([@othiym23](https://github.com/othiym23))
* [`127bf63`](https://github.com/othiym23/packard/commit/127bf63e490dbeec67c4cb87473f0e1e1a1db71c) Cover inherits from File. ([@othiym23](https://github.com/othiym23))
* [`607e847`](https://github.com/othiym23/packard/commit/607e8472c11c2588487a3a635b205072ede1d469) Add a Cuesheet that inherits from File. ([@othiym23](https://github.com/othiym23))
* [`74e5d2c`](https://github.com/othiym23/packard/commit/74e5d2c3832569bd5b03e0a97faf156b3a093e71) Add an Archive and an AudioFile that inherits from File so all the commonly-used entity types are included in the model. ([@othiym23](https://github.com/othiym23))
* [`02c84e4`](https://github.com/othiym23/packard/commit/02c84e4b06419a89d51f670176571ce23d7b58c5) Add a function to convert a Track into a SingletrackAlbum. ([@othiym23](https://github.com/othiym23))
* [`11ad51e`](https://github.com/othiym23/packard/commit/11ad51e4b157642889f0f21be37881fbe6f87ddd) Update Albums to initialize more values based on optional passed-in values. ([@othiym23](https://github.com/othiym23))
* [`24d1f8c`](https://github.com/othiym23/packard/commit/24d1f8cdfc0d2afeea09bc1f05d3d481006b8d21) Switch to model references from simple strings for album and track artists and track references to albums. ([@othiym23](https://github.com/othiym23))
* [`57438ed`](https://github.com/othiym23/packard/commit/57438eda2af615dfc3c4644217fa4016dd1151d3) Move Album tracklist sorting onto the model. ([@othiym23](https://github.com/othiym23))
* [`b96fca8`](https://github.com/othiym23/packard/commit/b96fca89ae89783b575700e2180aca12caa40524) Extract the model into [`@packard/model`](http://npm.im/@packard/model). ([@othiym23](https://github.com/othiym23))
* [`0a0622d`](https://github.com/othiym23/packard/commit/0a0622d0c052322add906080a0eb69962c5021d2) Instead of throwing an error when encountering an unfamiliar file type, log a warning and map it to a File. ([@othiym23](https://github.com/othiym23))
* [`5d97150`](https://github.com/othiym23/packard/commit/5d971508233a9b24f662ce45731e40a907bdb2b9) `unpack`: `sourceArchive` and `destArchive` are Archives now. ([@othiym23](https://github.com/othiym23))

#### refactoring & redesign

* [`c336dcd`](https://github.com/othiym23/packard/commit/c336dcdc5707a665cc2caf2d07faa65b5d40ca34) Extract `makePlaylist` into `src/utils/make-playlist.js`, and add the ability for `packard unpack --playlist` to write a playlist for that unpack run to a file. ([@othiym23](https://github.com/othiym23))
* [`4019ab9`](https://github.com/othiym23/packard/commit/4019ab96d4122887c30392f1c6702b788ffd771b) Extract playlist generation into `src/utils/make-playlist.js`. ([@othiym23](https://github.com/othiym23))
* [`37c5caf`](https://github.com/othiym23/packard/commit/37c5cafaf6b7703eaa005ffd7a01f99a3923cc72) Write functional tests for `readRoot`, because it didn't have any and was constantly crashing whenever anything feeding into it changed. ([@othiym23](https://github.com/othiym23))
* [`7f5a450`](https://github.com/othiym23/packard/commit/7f5a4504ff9c2ca45b16ab6b98ffa38f00325210) Extract `flatten` to `src/flatten-tracks.js`. ([@othiym23](https://github.com/othiym23))
* [`ced5ea8`](https://github.com/othiym23/packard/commit/ced5ea8fad9abfbc45e2e420c871f4a8a180e919) Rework how filesystem metadata is read to be based on reading the paths, rather than a recursive-descent traversal of `Artist -> Album -> Track`. ([@othiym23](https://github.com/othiym23))
* [`0dd770b`](https://github.com/othiym23/packard/commit/0dd770b70ccf0f1f40b67af352ad0df94680ad47) Switch to the new audio file tree reader. ([@othiym23](https://github.com/othiym23))
* [`74e5d2c`](https://github.com/othiym23/packard/commit/74e5d2c3832569bd5b03e0a97faf156b3a093e71) The code mentions "bundles" in a few places, without there being any clear concept of what they are (except as a convenient way to attach bits of data to a set of entities as various functions decorate files with metadata). Try to make that more concrete by replacing `bundles` with more concrete entities wherever possible. ([@othiym23](https://github.com/othiym23))
* [`75e0ab3`](https://github.com/othiym23/packard/commit/75e0ab37dbc123edae6c5577f1dfc98d96284d36) Simplify assembling tracks into albums ([@othiym23](https://github.com/othiym23))
* [`cd11f1b`](https://github.com/othiym23/packard/commit/cd11f1b6e3f280a55159b3ffc9144817ba4b3985) `flac.albumsFromFS` mostly duplicated `src/read-fs-artists.js`, so consolidate on the latter. ([@othiym23](https://github.com/othiym23))
* [`dd325c7`](https://github.com/othiym23/packard/commit/dd325c7760478f506b3160e741a9686df603bbb6) Separate track metadata scanning from album assembly. ([@othiym23](https://github.com/othiym23))
* [`752deb3`](https://github.com/othiym23/packard/commit/752deb3b684e4e085d95af309ca136f825482900) `src/read-tree.js` → `src/read-fs-artists.js`. ([@othiym23](https://github.com/othiym23))

#### tweaks

* [`27ce091`](https://github.com/othiym23/packard/commit/27ce091da42d81bc95be851f7b662d734b7ef2af) Add more entries to the list of filesystem cruft. ([@othiym23](https://github.com/othiym23))
* [`d80e342`](https://github.com/othiym23/packard/commit/d80e3421a1b7856b64ee557d5361d58520557434) (Re-)Flatten audio file trees when scanning albums. ([@othiym23](https://github.com/othiym23))
* [`4eb912f`](https://github.com/othiym23/packard/commit/4eb912f443413ae465abe360d61db6823b0e4625) Don't explode when confronted with zipfiles containing audio files in subdirectories. ([@othiym23](https://github.com/othiym23))
* [`bf302ba`](https://github.com/othiym23/packard/commit/bf302bad04e878f8a2392fdebcbc76a0802b5a4a) Upgrade dependencies, and remove eslint pragmas rendered superfluous by new version of `standard`. ([@othiym23](https://github.com/othiym23))
* [`99ad30f`](https://github.com/othiym23/packard/commit/99ad30fd391ce701886053de7b5cbcc53228ed05) Fix up spacing in two tests to make `standard` happy. ([@othiym23](https://github.com/othiym23))
* [`a6cba9a`](https://github.com/othiym23/packard/commit/a6cba9a837ef40f2cf1ad3ebec776b233a067d78) Since this program does pretty much nothing but work with files, use `graceful-fs` to make it better at working with files. ([@othiym23](https://github.com/othiym23))
* [`593ac69`](https://github.com/othiym23/packard/commit/593ac69e5aa086dfe9ef72817a073260065b4a0e) Got rid of an extraneous `.then()` in a test. ([@othiym23](https://github.com/othiym23))
* [`297b427`](https://github.com/othiym23/packard/commit/297b427361ef8b0cc78bcfdd60d4d4dbae328790) Use `.finally()` to simplify test cleanup. ([@othiym23](https://github.com/othiym23))
* [`67b2c33`](https://github.com/othiym23/packard/commit/67b2c33bd92398a6dfb65db7ef82d53f8f7209c3) Convert from CJS to ES2015 imports everywhere. ([@othiym23](https://github.com/othiym23))
* [`eada3a6`](https://github.com/othiym23/packard/commit/eada3a69432bc0d245c8f73bb18bb5bbd7d246d7) More CJS into ES2015 imports. ([@othiym23](https://github.com/othiym23))
* [`9b01086`](https://github.com/othiym23/packard/commit/9b01086e3fd7c96fdecc768479bea29d92ebbd87) Update playlist generation to accommodate changes to model. ([@othiym23](https://github.com/othiym23))
* [`17f2564`](https://github.com/othiym23/packard/commit/17f2564540fd3e530e6a0a2d1d88deb01c640198) Use only ES2015 module syntax for both exporting and importing. ([@othiym23](https://github.com/othiym23))
* [`5b805dc`](https://github.com/othiym23/packard/commit/5b805dc5de7ce607f9bd1c7297a07a5177e84dc4) The tests are still ES5.1, though. ([@othiym23](https://github.com/othiym23))
* [`66e38bd`](https://github.com/othiym23/packard/commit/66e38bd8369e1ecad979a0021e0becc9bd04f61f) `tap@1.3` gathers coverage information natively, which considerably simplifies coverage gathering. Verify that the code passes `standard` before running test suite. ([@othiym23](https://github.com/othiym23))
* [`2c165fc`](https://github.com/othiym23/packard/commit/2c165fc00df4f825daac4fe2da77e94934d94260) Run `coverage` instead of `coveralls` for Travis. ([@othiym23](https://github.com/othiym23))
* [`a04a559`](https://github.com/othiym23/packard/commit/a04a55929a13dfcefe84f843228bff3aa46bc781) Change test name to match the name of the module under test within the source tree. ([@othiym23](https://github.com/othiym23))
* [`e0cedfa`](https://github.com/othiym23/packard/commit/e0cedfaeaa479e9cc215f0024540d2a7488ebb51) `es6-shim` → `babel/polyfill`. ([@othiym23](https://github.com/othiym23))
* [`9f6b772`](https://github.com/othiym23/packard/commit/9f6b77238285d1c13a75bbd51313e3a8163b52d9) Update to a version of tap that tolerates cyclical object references thanks to [`only-shallow`](http://npm.im/only-shallow) and [`deeper`](http://npm.im/deeper). ([@othiym23](https://github.com/othiym23))
* [`b52d5be`](https://github.com/othiym23/packard/commit/b52d5be618b66a47ae1168c0d8b60f9e85de9d57) Don't crash when encountering `.avi` files. ([@othiym23](https://github.com/othiym23))
* [`88af7c1`](https://github.com/othiym23/packard/commit/88af7c115df91844133e45433d50d58f8540a2fc) Don't crash when audio files don't contain metadata. ([@othiym23](https://github.com/othiym23))
* [`cdd1ce9`](https://github.com/othiym23/packard/commit/cdd1ce9e71eee3b53e837f246497ccdec70ea40b) The FLAC writer gets confused if you're trying to use the module concurrently; serialize FLAC tag writing. ([@othiym23](https://github.com/othiym23))
* [`bc946e5`](https://github.com/othiym23/packard/commit/bc946e564708faa5d8815463a390b2f88674f84a) When generating a stubbed album for tests, add support for track templates to `metadata.makeAlbum`. ([@othiym23](https://github.com/othiym23))
* [`a95856f`](https://github.com/othiym23/packard/commit/a95856fd054af4a5ecf7f9b6284477834d4dd335) When creating an archive of stubbed albums for tests, support relative paths, and delete stub files as they're added to the archive. ([@othiym23](https://github.com/othiym23))
* [`71ad5a3`](https://github.com/othiym23/packard/commit/71ad5a3b77d8722f5267ee964d434db69612a9de) Filter out dotfiles when unpacking zipfiles. ([@othiym23](https://github.com/othiym23))
* [`fefe8bd`](https://github.com/othiym23/packard/commit/fefe8bd58bd9ec2bdf972ded4405eb93be650218) Add logging. ([@othiym23](https://github.com/othiym23))
* [`d4edc74`](https://github.com/othiym23/packard/commit/d4edc74d4dcb80c56ad49c70877f5df390f602e3) Add Node.js 4 to the testing matrix. ([@othiym23](https://github.com/othiym23))
* [`c01d307`](https://github.com/othiym23/packard/commit/c01d3073e035b6c3b750c3e2c9e38a3d71caafe2) Clean up dependencies and sweep for new `standard` warnings. ([@othiym23](https://github.com/othiym23))

#### g'bye, TOML

* [`651e426`](https://github.com/othiym23/packard/commit/651e426aec43c4bf14992cc2dd759d1e46a459c7) TOMLStream is departing to find a new home in its own magical world. ([@othiym23](https://github.com/othiym23))
* [`4cf02e0`](https://github.com/othiym23/packard/commit/4cf02e06bdcaee9a5c0919586f02dd77780ff664) Clean up `TODO.md`, including removing TOMLStream entries. ([@othiym23](https://github.com/othiym23))

### v2.2.0 (2015-03-15):

#### `packard pls`

* [`27730ca`](https://github.com/othiym23/packard/commit/27730cad0c3daca1949621c35c487c56922e29d5) Document `packard pls`. ([@othiym23](https://github.com/othiym23))

#### `packard inspect`

* [`2b74c10`](https://github.com/othiym23/packard/commit/2b74c10245178e2d2cc7f251b1235761e3e3b2b0) Document `packard inspect`. ([@othiym23](https://github.com/othiym23))

#### continuous integration

* [`2be2104`](https://github.com/othiym23/packard/commit/2be210478819d32b840ffa5bd297c9c830a06da5) Continuous integration is a good idea, so add `packard` to Travis. ([@othiym23](https://github.com/othiym23))
* [`0f725d7`](https://github.com/othiym23/packard/commit/0f725d7fba351cd7b7c6be0b353722c07ae3f5bf) Containerized builds are faster, so enable them (by turning off the need for sudo?). ([@othiym23](https://github.com/othiym23))
* [`894f86c`](https://github.com/othiym23/packard/commit/894f86c0d4c75ea04acbe2c86617c80ed4af78a3) Add [`istanbul`](http://npm.im/istanbul) to measure coverage of transpiled JavaScript, which is imperfect (how will I ever get to 100% coverage ;\_;), but better than nothing. ([@othiym23](https://github.com/othiym23))
* [`768d172`](https://github.com/othiym23/packard/commit/768d172cbdcca6ad8a1f58f65205417110dd96f2) Only transpile once when running with istanbul. ([@othiym23](https://github.com/othiym23))
* [`839316b`](https://github.com/othiym23/packard/commit/839316b1b0a942beab9ca5b8e7ae103db3c2146c) Send coverage information to [coveralls.io](https://coveralls.io/r/othiym23/packard). ([@othiym23](https://github.com/othiym23))
* [`37a054a`](https://github.com/othiym23/packard/commit/37a054aa1a16921747c38aafa89fac5359a221ea) Report to coveralls.io on successful Travis builds. ([@othiym23](https://github.com/othiym23))
* [`5cb1cf7`](https://github.com/othiym23/packard/commit/5cb1cf79e3bb4927c32de4fed9d2f4b11e09f681) Only run coveralls from Travis. ([@othiym23](https://github.com/othiym23))
* [`5dd5fb1`](https://github.com/othiym23/packard/commit/5dd5fb13ba09072473bc22311dbb03c8f022e375) Depend directly on `standard`. ([@othiym23](https://github.com/othiym23))

#### test improvements

* [`8024cb7`](https://github.com/othiym23/packard/commit/8024cb7339cd65e7f4309c576c548d2c6f4b5025) Add tests for Albums, which now must be passed a name and album artist at creation time. ([@othiym23](https://github.com/othiym23))

#### TOML support

* [`6f7f8c9`](https://github.com/othiym23/packard/commit/6f7f8c9d846fd8cd0bbc6e85b7f9ee9c5964fc3a) WIP: Add a streaming TOML generator. ([@othiym23](https://github.com/othiym23))

#### tweaks

* [`fb98cb6`](https://github.com/othiym23/packard/commit/fb98cb6fcea787dc0f8b47f3c006bd9d797250bf) Convert ES6 classes to use ES6 module syntax. ([@othiym23](https://github.com/othiym23))
* [`09e915b`](https://github.com/othiym23/packard/commit/09e915b4c8b2bd6f85307e028f19c0ea1022caed) Update all the deps, unpinning `rimraf` because `glob@5.0.3` fixes the bad interaction between the two. ([@othiym23](https://github.com/othiym23))
* [`dd64e9b`](https://github.com/othiym23/packard/commit/dd64e9b9c8432b3c1f6d056cc5b6852f4dee9d7a) `yargs` no longer prefixes the binary name with `'node '`. ([@othiym23](https://github.com/othiym23))
* [`f2957d7`](https://github.com/othiym23/packard/commit/f2957d7326f62f4179e6112cfa6d3ea75e5f2862) `standard` is pickier about returning from `module.main`, so replace returns from switch with `break`. ([@othiym23](https://github.com/othiym23))
* [`0bcb117`](https://github.com/othiym23/packard/commit/0bcb11725af89e5b80de3689de8daef763d05c50) `standard` no longer requires eslint pragmas to overwrite global Promise with imported Bluebird. ([@othiym23](https://github.com/othiym23))
* [`d62ebd9`](https://github.com/othiym23/packard/commit/d62ebd93ad2015fe96e03975f6267d4a92eb248b) `src/zip-utils.js` → `src/utils/zip.js` ([@othiym23](https://github.com/othiym23))
* [`e4ecf3f`](https://github.com/othiym23/packard/commit/e4ecf3f9e0cff02059d6671b65344b8b9a9dcc55) It's nice to keep sample output around, but it doesn't need to be part of the repo. ([@othiym23](https://github.com/othiym23))

### v2.1.2 (2015-03-09):

* [`db778fb`](https://github.com/othiym23/packard/commit/db778fbdfc011b7e689796148143f0734e9d99c2) `unpack`: Adding better functional tests flushed out a bug in album assembly from metadata! ([@othiym23](https://github.com/othiym23))
* [`ceee209`](https://github.com/othiym23/packard/commit/ceee2098e460d1be7717f0799df4ec737517f255) `standard@3.0.0-beta.0` is slightly more stringent about some style choices. ([@othiym23](https://github.com/othiym23))
* [`3a7ca54`](https://github.com/othiym23/packard/commit/3a7ca5465351b8635a4dccf27afd3db1417c4e09) Update dependencies, but pin rimraf because `rimraf@2.3` interacts badly with `glob@5.0.0`. ([@othiym23](https://github.com/othiym23))

### v2.1.1 (2015-03-09):

* [`2605a92`](https://github.com/othiym23/packard/commit/2605a9285dff7317d041e507516203bf984cf5f6) Write functional tests for `src/unpack.js` and `src/zip-utils.js`. ([@othiym23](https://github.com/othiym23))
* [`2ee2915`](https://github.com/othiym23/packard/commit/2ee291542b92a85c93fba220efb62b507714523c) Add `yargs` summary for `npm pls`. ([@othiym23](https://github.com/othiym23))
* [`ef1f9f0`](https://github.com/othiym23/packard/commit/ef1f9f0f7615aa660bc72c13f59267cb806fe300) Use Bluebird's `Promise.map()` instead of `Promise.resolve().map()`. ([@othiym23](https://github.com/othiym23))
* [`50c04a3`](https://github.com/othiym23/packard/commit/50c04a3e5d8ad5abb61b604984b22bcd2e1a7ecc) Clean up logging a little. ([@othiym23](https://github.com/othiym23))

### v2.1.0 (2015-03-08):

#### `packard pls`

Now that iTunes is no longer usable for, you know, listening to music, I've switched to [Vox](http://coppertino.com/vox/mac), which is a WinAmp-style audio player with a radically simpler UI and support for FLAC playback. It's not a library manager, and while it supports collections, it's really oriented around playlists. `packard pls` is a simple tool to produce playlists that can be dragged and dropped into Vox, and is written to support the way I most commonly listen to my new purchases – as albums, sorted by release date.

* [`1be21f4`](https://github.com/othiym23/packard/commit/1be21f47b565d7b0820086386cc7f8bc64561f78) `pls`: Add a command to print a M3U version 2 playlist to standard output, with tracks grouped into albums that play by their original album track order, and with the albums sorted by their release date. ([@othiym23](https://github.com/othiym23))
* [`920189d`](https://github.com/othiym23/packard/commit/920189de07c1ad48da0a21b6825b539ca0e29c39) `scanAlbums` helps map a set of file trees to a set of scanned albums built from embedded FLAC metadata. ([@othiym23](https://github.com/othiym23))

#### `packard inspect`

This is mostly just useful for debugging purposes, and will either change form dramatically (i.e. shift to using YAML or some other more readable output format than raw JSON) or go away altogether.

* [`1a1dc25`](https://github.com/othiym23/packard/commit/1a1dc25433d22511659c4432e28921e21b92c403) `inspect`: Add a command to dump all the metadata packard attaches to a file. ([@othiym23](https://github.com/othiym23))
* [`28aed66`](https://github.com/othiym23/packard/commit/28aed66ae6cc592d38912cd849945d02075e0e10) Dump extracted metadata tags now that there's generalized FLAC tag data extraction. ([@othiym23](https://github.com/othiym23))

#### `packard unpack`

* [`d777929`](https://github.com/othiym23/packard/commit/d777929df63efa167e7a557bbf29461ce38a83b7) `unpack`: Only glob when both pattern and root are set. ([@othiym23](https://github.com/othiym23))
* [`0150449`](https://github.com/othiym23/packard/commit/0150449ae4d498c4aec2886ca828d845800b803d) Limit the number of zipfiles being extracted simultaneously to 2 and serialize extraction of files from archives. ([@othiym23](https://github.com/othiym23))

#### `packard artists`

* [`6f0b7de`](https://github.com/othiym23/packard/commit/6f0b7de8d793bc32bb7a82a4a1b957f5d1b7bbd9) `artists`: Don't print report header if there are no albums to show. ([@othiym23](https://github.com/othiym23))
* [`0df93fc`](https://github.com/othiym23/packard/commit/0df93fcc5be14ae81055c838977da359083598ad) `artists`: Use FLAC metadata when assembling lists of artists and albums, not just path data. Print one set of artists per root. Add auditing of tracks based on FLAC metadata. ([@othiym23](https://github.com/othiym23))

#### tweaks

* [`0e1b239`](https://github.com/othiym23/packard/commit/0e1b2396fb00807ad9ab8a9c2816670cc6c4ae37) Set track duration from FLAC stream data. ([@othiym23](https://github.com/othiym23))
* [`4d6671f`](https://github.com/othiym23/packard/commit/4d6671f9955bf7680f0ec4b6e59320f83500b4f0) Fix regression caused by missing a place where `.filename` should have been changed to `.extractedPath`. ([@othiym23](https://github.com/othiym23))
* [`c738071`](https://github.com/othiym23/packard/commit/c73807186ca16ca9557c9e69bad9fb0ab40dcd52) Switch from ES6 Promises to [Bluebird](http://npm.im/bluebird). ([@othiym23](https://github.com/othiym23))
* [`030cc42`](https://github.com/othiym23/packard/commit/030cc421342bf2d5e04b8850c766a2e75d8aa610) Use Bluebird more idiomatically while mapping filesystem metadata to packard models. ([@othiym23](https://github.com/othiym23))
* [`a6c1603`](https://github.com/othiym23/packard/commit/a6c16032c33938c934394ffdaca01c3e1233b9ce) Generalize track path handling by changing `extractedPath` to `fullPath` (which is less tied to archives). ([@othiym23](https://github.com/othiym23))
* [`e84fdc8`](https://github.com/othiym23/packard/commit/e84fdc8a223e375b3431c3ec24cf078cd5c07b10) Add logging. ([@othiym23](https://github.com/othiym23))
* [`9732b81`](https://github.com/othiym23/packard/commit/9732b816be3dd3357391420754603ed966bf073d) Tell `standard` to ignore transpiled files. ([@othiym23](https://github.com/othiym23))
* [`76ae5ac`](https://github.com/othiym23/packard/commit/76ae5ac8052e7829dd9e02f183300f679dcd4f9f) Removed unused prototype leftovers. ([@othiym23](https://github.com/othiym23))

#### refactoring

* [`2826a68`](https://github.com/othiym23/packard/commit/2826a68786063d1ce5043c79b3db3cbc821e5935) `unpack`: Extract command handler into `src/unpack.js`. ([@othiym23](https://github.com/othiym23))
* [`ca43929`](https://github.com/othiym23/packard/commit/ca439294898ef80ab74be2f0d89528769e59367e) Reorder commands to be in alphabetical order within `src/cli.js`. ([@othiym23](https://github.com/othiym23))
* [`2aa72bc`](https://github.com/othiym23/packard/commit/2aa72bcc7ce3e439783713cb36a570a4e92fdf83) Extract FLAC-related functions when assembling artists / albums to `src/metadata/flac.js`. ([@othiym23](https://github.com/othiym23))
* [`dda8593`](https://github.com/othiym23/packard/commit/dda859371fcd9652c5de58fa0e849074041be168) Extract generic function to flatten nested arrays produced by FS reader into a set of tracks. ([@othiym23](https://github.com/othiym23))
* [`b9f4e0c`](https://github.com/othiym23/packard/commit/b9f4e0ce5432cac04784cfd21630e4b69e7edea7) Rename sort function to `bySizeReverse` for consistency. ([@othiym23](https://github.com/othiym23))

### v2.0.4 (2015-03-02):

* [`7990a8a`](https://github.com/othiym23/packard/commit/7990a8a649499fe6f35db0b7d704c69315c70982) Fix regression in `packard artists`. The tests exist for a reason, you know. ([@othiym23](https://github.com/othiym23))

### v2.0.3 (2015-03-01):

* [`daebaff`](https://github.com/othiym23/packard/commit/daebaff89f1cecd5e1ec29b42248ef9ced4ce453) Fix the repository URL so it matches the current name of the project. ([@othiym23](https://github.com/othiym23))

### v2.0.2 (2015-03-01):

* [`7b96512`](https://github.com/othiym23/packard/commit/7b965126de09f484d89024f9fba6cb9aad945712) Don't unpack zipfiles already located under `--archive-root`. ([@othiym23](https://github.com/othiym23))
* [`db89279`](https://github.com/othiym23/packard/commit/db892799def878df32814f5025599f6db6b30eea) Don't overwrite already-archived zipfiles. ([@othiym23](https://github.com/othiym23))
* [`fc8e496`](https://github.com/othiym23/packard/commit/fc8e4964584b95cb6d770fe51457d4dfba031a6d) If, after globbing and filtering zipfiles passed to `packard unpack`, no zipfiles are left to process, `C U L8R SAILOR`! ([@othiym23](https://github.com/othiym23))
* [`76615dc`](https://github.com/othiym23/packard/commit/76615dc98ddef2f79292431702fa39882a5dcfe3) Reading boolean values from environment variables is tricky (use `Boolean()` when in doubt!). ([@othiym23](https://github.com/othiym23))
* [`55350fc`](https://github.com/othiym23/packard/commit/55350fce026203decd1f2703e662c46927817bb4) `npmlog`'s defaults make for a very small amount of text and a very large progress bar, so make the text chunk of the bar wider. ([@othiym23](https://github.com/othiym23))
* [`85fa282`](https://github.com/othiym23/packard/commit/85fa282b864f6873c0ee1563619302a26619f6bd) I like using the Unicode clock icons for the packard progress bars. ([@othiym23](https://github.com/othiym23))
* [`f5041dc`](https://github.com/othiym23/packard/commit/f5041dce4931c63524e2b31bfc97b3eafc7ebf38) Remove dependencies duplicated between `devDependencies` and `dependencies`. ([@othiym23](https://github.com/othiym23))

### v2.0.1 (2015-03-01):

* [`657e709`](https://github.com/othiym23/packard/commit/657e7098cf737ffc39153ded695080504b559fe8) Only write audio files that don't already exist when placing releases. ([@othiym23](https://github.com/othiym23))
* [`a2e7ab6`](https://github.com/othiym23/packard/commit/a2e7ab6a88d82387709edb24cccae9ab7525c73e) Update README to match actual `npm unpack` output. ([@othiym23](https://github.com/othiym23))

### v2.0.0 (2015-03-01):

#### `packard unpack`

I buy almost all of my music online as FLACs now, mostly from the 4 Bs: Boomkat, Beatport, Bleep, and Bandcamp. Most of them distribute purchased releases as FLAC files rolled up into zipfiles: Boomkat and Bandcamp with one zipfile per release, and Bleep with many releases combined into a single archive. (Beatport, despite having a fantastic selection of dance music, only sells lossless audio as (expensive) WAVs that have to be downloaded _individually_, and they also don't embed any metadata into the files, requiring me to transcode to FLAC and add metadata by hand using [XLD](http://tmkk.undo.jp/xld/index_e.html), which is probably something packard should handle, although it's out of scope for now.)

Unpacking these files by hand isn't a huge job, but it's got a number of steps, and since I tend to buy a whole bunch of releases at once (and frequently forget one or more of the steps), this is a natural workflow to automate.

* [`93bc711`](https://github.com/othiym23/packard/commit/93bc7111a8e066eca9c78dfd46e481aa9a8275b8) Use [`decompress-zip`](http://npm.im/decompress-zip) to unpack zipfiles containing digital releases, and use [`flac-parser`](http://npm.im/flac-parser) to read the metadata out of the extracted audio files. Add [`npmlog`](http://npm.im/npmlog) for those sweet progress bars. ([@othiym23](https://github.com/othiym23))
* [`b15ef86`](https://github.com/othiym23/packard/commit/b15ef8636a8312829cfc420810745ca6b5d1d27c) Replace `decompress-zip` with [`yauzl`](http://npm.im/yauzl) for because the latter is a streaming reader, which among other things works better with progress bars. ([@othiym23](https://github.com/othiym23))
* [`a17ddbc`](https://github.com/othiym23/packard/commit/a17ddbc760b1aeeba17248f5a8c68a51d67be7d9) Use the metadata read from the extracted audio files to assemble tracks into releases. ([@othiym23](https://github.com/othiym23))
* [`a24022d`](https://github.com/othiym23/packard/commit/a24022d5e3c24a51c309778e97c5c0c3b930ef7d) Add heuristics to discriminate between single-artist, 2-artist split, and compilation releases. ([@othiym23](https://github.com/othiym23))
* [`fbaa13a`](https://github.com/othiym23/packard/commit/fbaa13a9c8bc36688c3a8dfe1bea4925e3912b26) Find cover pictures and attach them to their related albums. ([@othiym23](https://github.com/othiym23))
* [`c84ee66`](https://github.com/othiym23/packard/commit/c84ee665d0f6894bca5b5558a192ee3c67bdcd1b) Clarify where the release was extracted to in the report. ([@othiym23](https://github.com/othiym23))
* [`f9506f6`](https://github.com/othiym23/packard/commit/f9506f6d8fe03f3f556d331eecf38ab4973ca40d) Update the docs for `packard unpack` and the new options. When `--archive-root` and `--archive` are set, move zipfiles to the standard home for zipfiles. ([@othiym23](https://github.com/othiym23))

#### packard gets its own configuration file

I work on the npm CLI for my day job, and one of its most powerful features is its almost overbearingly flexible configuration framework. npm's configuration framework is overcomplicated and hard to master (and makes it hard to do things like add an `npm exec` because of the way centralizing the configuration handling makes it difficult for npm commands to know whether npm knows whether a configuration parameter is allowed in the current context or not), but it's also very useful. By adding a `--save-config` command-line argument, and also creating a simple .ini-style configuration file, I'm trying to capture the 80% of that that's useful without hemming myself in too much.

* [`f825fb9`](https://github.com/othiym23/packard/commit/f825fb960a7ca543555626ddf4a1dea716da2a57) Use [`rc`](http://npm.im/rc) to set `packard` configuration from `~/.packardrc`. Also introduce [`untildify`](http://npm.im/untildify) to handle `~/paths` in quoted config (and on Windows command lines). ([@othiym23](https://github.com/othiym23))
* [`dbb2bd1`](https://github.com/othiym23/packard/commit/dbb2bd1646f5dea3aef1e3f4c23c0d1189f69adf) Use [`ini`](http://npm.im/ini) to save the configuration parameters passed to the current command when `--save-config` is included. Configuration can be round-tripped between `~/.packardrc` and the command line. ([@othiym23](https://github.com/othiym23))

#### why not use standard?

* [`628c4dc`](https://github.com/othiym23/packard/commit/628c4dc05accc325c8f38ee237bd8c0304bd3e81) Switch from `eslint` to `standard` for code style. ([@othiym23](https://github.com/othiym23))

#### refactoring

* [`a13bda2`](https://github.com/othiym23/packard/commit/a13bda270f35fdda07952b3109af4fe3fd4a07a3) `packard unpack`: Extract unpacking into its own function (for the command), and extract zipfile extraction and FLAC metadata reading into their own modules. ([@othiym23](https://github.com/othiym23))
* [`b19b85f`](https://github.com/othiym23/packard/commit/b19b85f897283e70585a97fe1803340b2c107159) `packard unpack`: Extract the track to album mapping function (`makeAlbums`) into the FLAC module. ([@othiym23](https://github.com/othiym23))
* [`bab54c4`](https://github.com/othiym23/packard/commit/bab54c49751e50d6340973b20e72e7f2ee106f8f) `packard unpack`: Pull zipfile extraction out into `src/metadata.index.js`. ([@othiym23](https://github.com/othiym23))

#### cleanup

* [`c298bf0`](https://github.com/othiym23/packard/commit/c298bf0c7974089295686a9cd25d69ef1707c225) Track numbers should be two digits with leading zeroes so that lexically sorting the files in an album directory produces the album order for tracks. ([@othiym23](https://github.com/othiym23))
* [`0d185fe`](https://github.com/othiym23/packard/commit/0d185fe78ad1c7db2eee53e8878dcc205606e01b) Actually run the tests, and fix the typos that identifies. ([@othiym23](https://github.com/othiym23))

### v2.0.0-2 (2015-02-22):

* [`7841303`](https://github.com/othiym23/packard/commit/784130394012beeb2dd036379cef7d1bc1bf6d84) Add a shebang so `packard` will work as a globally-installed binary. ([@othiym23](https://github.com/othiym23))

### v2.0.0-1 (2015-02-22):

* [`51c601a`](https://github.com/othiym23/packard/commit/51c601a282c6ab811568f6bdf6b78f161090e917) ES6 arrow functions that take single arguments don't require parentheses around the argument list. ([@othiym23](https://github.com/othiym23))
* [`3a7288e`](https://github.com/othiym23/packard/commit/3a7288eae0484b72b67254346550249d6726291e) Split apart the filesystem metadata scanner into reusable pieces. ([@othiym23](https://github.com/othiym23))
* [`1042814`](https://github.com/othiym23/packard/commit/10428149f2dce2d869c02dfeaab2c61c7cef97de) `packard artists` no longer hardcodes the list of filesystem trees to scan. ([@othiym23](https://github.com/othiym23))

### v2.0.0-0 (2015-02-21):

#### `packard artists`

Eventually, packard should be a single binary that has many individual subcommands, all of which work together to simplify managing a large collection of audio files. I've [built audio file metadata managers before](https://github.com/othiym23/ingestion-tools) as console UIs, and disliked how restrictive it was to work within only a single workflow, so this time I want to do something more Unixy that allows me to use the tool to build up lists, edit them afterwards, and then feed that edited output back in to the next command.

For example:

1. Use `packard artists` to generate a list of artists for trees of FLAC and MP3 releases.
2. Edit out any artists I don't want to copy and feed that list into `packard albums` (TBD) to generate a list of releases for that artist.
3. Edit out any redundant or unwanted releases from _that_ list and feed it into `packard pack` (TBD) to pack as many of those releases as possible onto a micro SD card for use with a portable audio player.

The overall look and feel for `packard` shouldn't be too dissimilar from npm, but I'm using [`yargs`](http://npm.im/yargs), which my colleague and friend ([@bcoe](https://github.com/bcoe)) recently adopted, instead of npm's convoluted configuration framework.

For `packard@2`, add the first of those commands, `packard artists`, which takes the existing functionality and wraps it up into a subcommand.

* [`403ac13`](https://github.com/othiym23/packard/commit/403ac13566149bd4967c47af274bb639f9a83cde) **BREAKING** `music-packer` → `packard`, with an actual README, included license, command-line argument handling, and tests. ([@othiym23](https://github.com/othiym23))

### v1.0.0 (2015-02-21):

Rewrite the prototype as idiomatic ES6 code. The only user-visible change is to add section headers to the printed report for the album and artist summaries.

* [`62369ee`](https://github.com/othiym23/packard/commit/62369eedcf66b8971d2c0ace21813078ff1558c9) `.forEach()` → `for...of` ([@othiym23](https://github.com/othiym23))
* [`83219a1`](https://github.com/othiym23/packard/commit/83219a1133f9b7404a9485e8ca2470048691f25d) `let` → `const` ([@othiym23](https://github.com/othiym23))
* [`937344e`](https://github.com/othiym23/packard/commit/937344ec4ca660b63048cc4f05135c17a1fb34dd) Use a less fragile asynchronous iteration protocol. ([@othiym23](https://github.com/othiym23))
* [`20f7c5a`](https://github.com/othiym23/packard/commit/20f7c5a147261c0e2dbf76b2706cedc17ad3c06f) Only touch counter using iterator function. ([@othiym23](https://github.com/othiym23))
* [`0cf5b3f`](https://github.com/othiym23/packard/commit/0cf5b3f45f317f1b7054f09163b90f5bedf2375c) Replace _ad hoc_ iteration protocol with Promises. ([@othiym23](https://github.com/othiym23))
* [`c524bf2`](https://github.com/othiym23/packard/commit/c524bf22b89d3ddd0f22e2a31fc1c240f4b81e5c) `eslint` knows about some ES6 features now. ([@othiym23](https://github.com/othiym23))
* [`ef4e6b0`](https://github.com/othiym23/packard/commit/ef4e6b0dbb12e202f6df02c7570f094e83aa34be) When creating an Album, default tracks to an empty array so a blank Album won't crash when the tracks are used. ([@othiym23](https://github.com/othiym23))
* [`181fef1`](https://github.com/othiym23/packard/commit/181fef1dc8270921dba430bb215118fd94ea8257) When scanning filesystem, read a whole directory at a time using a visitor pattern. ([@othiym23](https://github.com/othiym23))
* [`4b2c6ee`](https://github.com/othiym23/packard/commit/4b2c6eec040e0815c9f6815c943cd87b5231a093) Don't need a global map of Cuesheets. ([@othiym23](https://github.com/othiym23))
* [`4347f0a`](https://github.com/othiym23/packard/commit/4347f0a031a2a114111be9d6e7ab1071ddb46d12) Build up the list of Artists across all provided roots. ([@othiym23](https://github.com/othiym23))
* [`7428c57`](https://github.com/othiym23/packard/commit/7428c57cdec6991dd80578c7a8f5cd7b32d2045b) Be more consistent about removing holes from arrays. ([@othiym23](https://github.com/othiym23))
* [`d804ee3`](https://github.com/othiym23/packard/commit/d804ee38cc8da1716db584ae91951f16e90fec6f) Simplify hole removal. ([@othiym23](https://github.com/othiym23))

### v1.0.0-0 (2015-02-17):

Write a prototype to map a (hardcoded) `Artist/Album/*.flac` tree of FLAC files into a set of model objects representing artists, albums, tracks, and cover pictures, using only metadata scraped from the filesystem hierarchy and individual track names. At the end, print out a list of the albums found including their size in megabytes, and a list of the artists found, with the total size of all their tracks in megabytes.

For funsies, transpile from ES6. For learning purposes, follow as many best practices as practical.

* [`77cf1bd`](https://github.com/othiym23/packard/commit/77cf1bd0c0fc278c7780f7d513317155e409bc30) Summarize artists and albums found under `/Users/ogd/Music/flac`. ([@othiym23](https://github.com/othiym23))
