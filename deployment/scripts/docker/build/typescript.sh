#!/bin/bash
cd "${0%/*}" # change to the directory this script is in (bin)
cd ../../../../typescript/
docker build -t nodejs/typescript .
