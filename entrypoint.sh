#!/bin/sh
set -e

replace_envs () {
  # sets the backend url for each language the site is in
  # each language has its own subfolder, having its own env.js
  for dir in /usr/share/nginx/html/*/
  do
    sed -i "s@window.__env.apiUrl = 'api'@window.__env.apiUrl = '${API_URL}'@" ${dir}env.js
  done
}

if [[ ! -z "$API_URL" ]]; then
  replace_envs
fi

if [ "$1" = "run" ]; then
  exec nginx -g "daemon off;"
else
  exec "$@"
fi
