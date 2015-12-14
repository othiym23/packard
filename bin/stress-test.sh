#!/bin/bash

set -e

cd "$(dirname "$0")/.."

cd /Users/ogd/Documents/projects/packard
for i in {1..1000}
do
    echo "run $i"
    tap -b test/command-unpack.js 2> /dev/null
done

echo 'I survived stress-testing and didn''t even get a Travis badge.'
