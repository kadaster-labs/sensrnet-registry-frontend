#!/bin/bash

set -ex
# SET THE FOLLOWING VARIABLES
USERNAME=sensrnet
REGISTRY=sensrnetregistry.azurecr.io
# image name
IMAGE=registry-frontend

# ensure we're logged on at the registry
az acr login --name sensrnetregistry

# ensure we're up to date
git pull
# bump version
npm version patch --git-tag-version=false

VERSION=$(node -pe "require('./package.json').version")
echo "version: $VERSION"

rm VERSION
echo "$VERSION" >> VERSION

# run build
./build.sh

# tag it
git add -A
git commit -m "release v$VERSION"
git tag -a "$VERSION" -m "release v$VERSION"
git push
git push --tags
docker tag $REGISTRY/$USERNAME/$IMAGE:latest $REGISTRY/$USERNAME/$IMAGE:$VERSION

# push it
docker push $REGISTRY/$USERNAME/$IMAGE:latest
docker push $REGISTRY/$USERNAME/$IMAGE:$VERSION
