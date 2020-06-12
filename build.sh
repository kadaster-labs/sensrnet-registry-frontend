#!/bin/bash

set -ex

USERNAME=sensrnet
# image name
IMAGE=registry-frontend

docker build -t $USERNAME/$IMAGE:latest .
