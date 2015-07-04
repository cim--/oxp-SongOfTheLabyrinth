#!/bin/sh
## This is the overall buildscript for the Song of the Labyrinth OXPs

echo "Building altmap OXP"

cd altmap
./buildscript.sh
cd ..

echo "Building exploration OXP"

cd exploration
./buildscript.sh
cd ..

echo "Building scenario OXP"

cd scenario
./buildscript.sh
cd ..

echo "Done"
