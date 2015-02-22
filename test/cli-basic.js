var resolve = require("path").resolve
var relative = require("path").relative

var nixt = require("nixt")
var test = require("tap").test

var p = resolve(__dirname, "../lib/cli.js")
var r = relative(process.cwd(), p)

var lines = function () {/*

Options:
  -R, --root  directory root for an Artist/Album tree

Not enough non-option arguments: got 0, need at least 1
*/}.toString().split("\n").slice(1, -1)

var prolog = "Usage: node "+r+" [options] <command>"

test("packard", function (t) {
  var expected = [prolog].concat(lines).join("\n")
  nixt()
    .run("node "+p)
    .stderr(expected)
    .code(1)
    .end(function (e) {
      t.ifError(e, "got expected default output")
      t.end()
    })
})

test("packard unknown", function (t) {
  var unknown = [prolog].concat(lines.slice(0, -1)).join("\n")
  nixt()
    .run("node "+p+" unknown")
    .stderr(unknown)
    .code(1)
    .end(function (e) {
      t.ifError(e, "got expected default output")
      t.end()
    })
})

test("packard artists", function (t) {
  nixt()
    .run("node "+p+" artists")
    .stdout("artists go here")
    .end(function (e) {
      t.ifError(e, "got expected default output")
      t.end()
    })
})
