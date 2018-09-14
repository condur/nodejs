#!/bin/bash
cd "${0%/*}" # change to the directory this script is in (bin)
cd ../../../../database/
docker build -t nodejs/database .
