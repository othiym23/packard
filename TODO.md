packard.todo

* `packard pack`
	- take as input a list (edited) output from `packard artists` or `packard albums` to determine albums to be packed
	- automatic transcoding from lossless to LAME V0 MP3s for better space efficiency
	- audit albums before writing
	- detect when pack will hard link instead of copy for size calculations

* `packard optimize`
	   - fold into `packard pack` as a `--dry-run` version **(breaking)**

* `packard place`
	- top-level command to move from staging to real root
	- support for combining two directories
	- only delete files that won't be in finished directory
	- only move files that need to be moved
	- rename directories to match album metadata
	- rename files to match metadata
	- audit albums before placing

* `packard archive`
	- top-level command to put archive files where they go, as well as audited 'final' files

* `packard cache`
	- top-level command to incrementally build / update cache of metadata for tracks
	- wire other commands up to use cache, when available
	- automatically trigger cache rebuild on need

* `packard audit`
	- make audit pluggable and configurable
	- extract genre list to configuration (with defaults)
	- flags:
		- remixes with '()' instead of '[]'
		- filenames that don't match metadata
		- tracks missing MBID / MB artist ID / MB album ID
		- MB metadata for non-"Digital Media" releases

* `packard albums`
	- take a list of artists and produce a list of albums from a root containing tracks by those artists

* `packard artists`
	- cue sheet handling
	- fix progress
	- tracks should be on albums, or in loose tracks, but not both for size calculation

* `packard inspect`
	- swap in TOML
	- swap in YAML
	- make output formatting configurable

* `packard pls`
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

* improve progress tracking
	* map list of files to progress groups
	* separate out code that knows about progress groups

* logging
	- audit logging levels

* tests
	- coverage to 100%

* automatically extract archives passed to `packard artists`, `packard pack`, etc
