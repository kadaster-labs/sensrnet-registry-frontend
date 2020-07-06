#!/bin/bash

exec npx ng serve --disable-host-check --host 0.0.0.0 --project=$PROJECT --configuration=$CONFIGURATION
