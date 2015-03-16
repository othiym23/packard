packard.todo

* tests
	- fix unpack via testing @done(2015-03-16)
	- set up for Travis @done(2015-03-16)
	- report coverage to coveralls.io @done(2015-03-16)
	- write my own framework

* TOMLStream
	- bootstrap from `utils/toml.js` @done(2015-03-16)
	- format integers @done(2015-03-16)
	- format floating-point values @done(2015-03-16)
	- simple string values
	- multi-line string values
	- date values
	- nested objects with periods in names
	- input as Map
	- disallow Array input
	- iterable for Object keys
	- string escaping
	- TOML parsing
	- schema support

* inspect
	- swap in TOML
	- swap in YAML
	- make output formatting configurable

* merge
	- top-level command to combine two directories

* place
	- top-level command to move from staging to real root

* archive
	  - top-level command to put archive files where they go, as well as audited 'final' files

* artists
	  - add cue sheet handling
	  - single-track album handling
	  - fix progress
	  - tracks should be on albums, or in loose tracks, but not both for report

* pls
	  - flatten multiple roots and sort the whole thing
	  - get album artist from flacTrack when possible

* audit
	  - top-level command to audit files or albums
	  - audit for albums as well

* logging
	  - fix log levels everywhere