#!/bin/bash

set -ex

USERNAME=sensrnet
REGISTRY=sensrnetregistry.azurecr.io
# image name
IMAGE=registry-frontend

docker build -t $REGISTRY/$USERNAME/$IMAGE:latest .
