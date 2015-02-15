#!/bin/sh
## This is the overall buildscript for the Song of the Witch OXPs

echo "Building main OXP"

cd main
./buildscript.sh
cd ..

echo "Building scenario OXP"

cd scenario
./buildscript.sh
cd ..

echo "Done"
