#!/bin/bash -ex

OXPNAME=SOTL_Exploration
VERSION=0.2

cd galaxybuilder
./galaxybuilder.js 2>&1
cp build/planetinfo.plist ../oxp/Config/
cd ..

. ../buildscript.common