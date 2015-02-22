#!/usr/bin/env node
const scanArtists = require("./artists.js")

const yargs = require("yargs")
                .usage("Usage: $0 [options] <command>")
                .help("h")
                .alias("h", "help")
                .command("artists", "generate a list of artists from roots")
                .array("R")
                .alias("R", "root")
                .required("R", "must have at least one tree to scan")
                .describe("R", "directory root for an Artist/Album tree")
                .version(() => require("../package").version)
                .demand(1)

switch (yargs.argv._[0]) {
  case "artists":
    scanArtists(yargs.argv.R).then(sorted => {
      for (let a of sorted) {
        console.log("%s [%s]", a.name, a.getSize(1024 * 1024))
      }
    }).catch(error => console.error("HURF DURF", error.stack))
    break
  default:
    yargs.showHelp()
    process.exit(1)
}
