#!/bin/bash -ex

OXPNAME=Song_of_the_Witch
VERSION=1.0

# Build galaxy data
cd galaxybuilder
./galaxybuilder.js
cp build/planetinfo.plist ../oxp/Config/
cd ..
echo '{' > oxp/Config/descriptions.plist
cat galaxybuilder/build/descriptions.plist.regional >> oxp/Config/descriptions.plist
cat src/descriptions.plist.static >> oxp/Config/descriptions.plist
echo '}' >> oxp/Config/descriptions.plist

. ../buildscript.common