Hey! If you're reading this, you're more than welcome to contribute to packard
development (or fork it or carve it up for your own purposes).  I've tried to
make it pretty simple and portable, but there are a few things to know.

You'll probably also want to read `TODO.md` to get an idea for what I think the
scope of the project is, and `README.md` for a reasonably current overview of
what it can currently do.

## Prerequisites for developers

- If you're using Node.js 4 or greater, you'll need a C++ compiler that
  complies to C++11 in order to build the small number of native modules this
  project uses. Right now, the only direct dependency is on @bnoordhuis's
  `buffertools`.
- The MP3 tests require `eyeD3`, a python tool for inspecting and setting
  metadata, to be on your path. There isn't a reliable tool that I've found for
  writing ID3v2 tags in pure JS, and long experience with `id3lib` has led me
  disinclined to use anything that binds to it. I've tried to integrate it in
  such a way that it will Just Work if it's on your path on Windows, and you
  should be able to get away with any version of eyeD3 0.6 or higher.
- The AAC tests require AtomicParsley, a tool written in C++ for inspecting and
  setting metadata in QuickTime files, to be on your path. There are even fewer
  tools for editing QT container atoms than robust ID3v2.4 editing tools, so
  this is what you'll need. I think it builds and runs on Windows without
  issue, so same deal as for `eyeD3` -- put it in your `PATH` and it should
  just work on Windows.
