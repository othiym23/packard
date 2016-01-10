packard.todo

* `packard pack`
	- top-level command to optimally pack a device with files for a prioritized list of artists, as whole albums @done(2016-01-10)
	- take as input a list (edited) output from `packard artists` or `packard albums` to determine albums to be packed
	- automatic transcoding from lossless to LAME V0 MP3s for better space efficiency

* `packard optimize`
	   - top-level command to read a set of roots and optimize the set of albums for a given target size @done(2015-11-28)
	   - fold into `packard pack` as a `--dry-run` version **(breaking)**
       
* `packard place`
	- top-level command to move from staging to real root
	- support for combining two directories
	- only delete files that won't be in finished directory
	- only move files that need to be moved
	- rename directories to match album metadata
	- rename files to match metadata

* `packard archive`
	- top-level command to put archive files where they go, as well as audited 'final' files

* `packard cache`
	- top-level command to incrementally build / update cache of metadata for tracks
	- wire other commands up to use cache, when available
	- automatically trigger cache rebuild on need

* `packard audit`
	- top-level command to audit files or albums @done(2015-11-27)
	- audit for albums as well @done(2015-11-27)
	- make audit pluggable and configurable
	- extract genre list to configuration (with defaults)
	- flags:
		- remixes with '()' instead of '[]'
		- filenames that don't match metadata
		- tracks missing MBID / MB artist ID / MB album ID
		- MB metadata for non-"Digital Media" releases
		- ALL CAPS / GENRE NAMES @done(2015-11-27)

* `packard albums`
	- top-level command to generate list of albums in a set of roots @done(2015-11-28)
	- take a list of artists and produce a list of albums from a root containing tracks by those artists

* `packard artists`
	- cue sheet handling
	- single-track album handling @done(2015-09-07)
	- fix progress
	- tracks should be on albums, or in loose tracks, but not both for size calculation

* `packard inspect`
	- swap in TOML
	- swap in YAML
	- make output formatting configurable

* `packard pls`
	- flatten multiple roots and sort the whole thing @done(2015-03-25)
	- get album artist from flacTrack when possible @done(2015-08-24)
	- output to file instead of stdout
	- generate playlists usable on-device by Rockbox

* simplify finding files to process
	* replace `src/read-fs-artists.js` with a simpler file-list reader
	* all subcommands use same function to map passed-in files, folders, or glob patterns to a list of files to operate on
	* decoupled, synchronous cruft filter
	* everything with a leading period is cruft
	* single source of truth for file types, regardless of origin (i.e. both from the file system and archives)
	* all commands operate on fsAlbums / fsTracks / archives rather than bare paths
	* handle albums split across multiple directories, as well as their cover art

* metadata
	- ID3v2 reading @done(2015-12-06)
	- m4a QT atom reading @done(2015-12-07)
	- extract MusicBrainz info into a MB metadata object @done(2015-11-27)

* improve progress tracking
	* map list of files to progress groups
	* separate out code that knows about progress groups

* logging
	- audit logging levels

* tests
	- fix unpack via testing @done(2015-03-16)
	- set up for Travis @done(2015-03-16)
	- report coverage to coveralls.io @done(2015-03-16)
	- figure out how to measure coverage against ES6 source @done(2016-01-10)
	- coverage to 100%

* automatically extract archives passed to `packard artists`, `packard pack`, etc

- models @done(2015-09-07)
	- clean up album and artist to take optional metadata similarly to track @done(2015-09-07)
	- split models out into separate package for use with `nothingness` @done(2015-09-07)
