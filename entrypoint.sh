#!/bin/bash

exec npx ng serve --disable-host-check --host 0.0.0.0 --project=$APP_PROJECT --configuration=$APP_CONFIGURATION
