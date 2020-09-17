#!/bin/sh

set -ex

args=""

if [ ! -z "${PROJECT}" ]; then
    args="$args --project ${PROJECT}"
fi

if [ ! -z "${CONFIGURATION}" ]; then
    args="$args --configuration ${CONFIGURATION}"
fi

if [ ! -z "${PROXY_CONFIG}" ]; then
    args="$args --proxy-config ${PROXY_CONFIG}"
fi

exec npx ng serve --host 0.0.0.0 --disable-host-check $args
