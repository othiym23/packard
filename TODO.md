packard.todo

* tests
	- fix unpack via testing @done(2015-03-16)
	- set up for Travis @done(2015-03-16)
	- report coverage to coveralls.io @done(2015-03-16)
	- write my own framework

* metadata
	- ID3v2 reading
	- m4a QT atom reading
	- extract MusicBrainz info into a MB metadata object

* place
	- top-level command to move from staging to real root
	- support for combining two directories
	- only delete files that won't be in finished directory
	- only move files that need to be moved
	- rename directories to match album metadata
	- rename files to match metadata

- models @done(2015-09-07)
	- clean up album and artist to take optional metadata similarly to track @done(2015-09-07)
	- split models out into separate package for use with `nothingness` @done(2015-09-07)

* artists
	- add cue sheet handling
	- single-track album handling @done(2015-09-07)
	- fix progress
	- tracks should be on albums, or in loose tracks, but not both for report

* albums
	- top-level command to generate list of albums in a set of roots
	- take a list of artists and produce a list of albums from a root containing tracks by those artists

* pack
	- top-level command to optimally pack a device with files for a prioritized list of artists, as whole albums

* cache
	- top-level command to incrementally build / update cache of metadata for tracks

* inspect
	- swap in TOML
	- swap in YAML
	- make output formatting configurable

* archive
	- top-level command to put archive files where they go, as well as audited 'final' files

* pls
	- flatten multiple roots and sort the whole thing @done(2015-03-25)
	- get album artist from flacTrack when possible @done(2015-08-24)

* audit
	- top-level command to audit files or albums
	- audit for albums as well
	- flags:
		- remixes with '()' instead of '[]'
		- filenames that don't match metadata
		- tracks missing MBID / MB artist ID / MB album ID
		- MB metadata for non-"Digital Media" releases
		- ALL CAPS / GENRE NAMES

* logging
	- fix log levels everywhere