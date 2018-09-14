#!/bin/bash
docker service update --no-resolve-image --force \
       --image nodejs/typescript:${TYPESCRIPT_DOCKER_IMAGE_TAG} \
       nodejs_typescript
