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

replace_envs_tenant_id () {
  for dir in /usr/share/nginx/html/*/
  do
    sed -i "s@window.__env.azuread_tenant_id = ''@window.__env.azuread_tenant_id = '${AZUREAD_TENANT_ID}'@" ${dir}env.js
  done
}

replace_envs_client_id () {
  for dir in /usr/share/nginx/html/*/
  do
    sed -i "s@window.__env.azuread_client_id = ''@window.__env.azuread_client_id = '${AZUREAD_CLIENT_ID}'@" ${dir}env.js
  done
}

if [[ ! -z "$API_URL" ]]; then
  replace_envs
fi

if [[ ! -z "$AZUREAD_TENANT_ID" ]]; then
  replace_envs_tenant_id
fi

if [[ ! -z "$AZUREAD_CLIENT_ID" ]]; then
  replace_envs_client_id
fi

if [ "$1" = "run" ]; then
  exec nginx -g "daemon off;"
else
  exec "$@"
fi
