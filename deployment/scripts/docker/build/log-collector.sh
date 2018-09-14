#!/bin/bash
cd "${0%/*}" # change to the directory this script is in (bin)
cd ../../../../log-collector/
docker build -t nodejs/log-collector .
