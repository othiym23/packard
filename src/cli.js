const yargs = require("yargs")
                .usage("Usage: $0 [options] <command>")
                .array("R")
                .alias("R", "root")
                .describe("R", "directory root for an Artist/Album tree")
                .demand(1)

switch (yargs.argv._[0]) {
  case "artists":
    console.log("artists go here")
    break
  default:
    yargs.showHelp()
    process.exit(1)
}
