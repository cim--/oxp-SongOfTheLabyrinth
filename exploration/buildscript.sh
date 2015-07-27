#!/bin/bash -ex

OXPNAME=SOTL_Exploration
VERSION=0.4

cd galaxybuilder
mkdir -p build
./galaxybuilder.js 2>&1
cp build/planetinfo.plist ../oxp/Config/
cd ..

. ../buildscript.common
