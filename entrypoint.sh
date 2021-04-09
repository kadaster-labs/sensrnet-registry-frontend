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

replace_envs_oidc_issuer () {
  for dir in /usr/share/nginx/html/*/
  do
    sed -i "s@window.__env.oidcIssuer = '/dex'@window.__env.oidcIssuer = '${OIDC_ISSUER}'@" ${dir}env.js
  done
}

replace_envs_oidc_client_id () {
  for dir in /usr/share/nginx/html/*/
  do
    sed -i "s@window.__env.oidcClientId = 'registry-frontend'@window.__env.oidcClientId = '${OIDC_CLIENT_ID}'@" ${dir}env.js
  done
}

if [[ ! -z "$API_URL" ]]; then
  replace_envs
fi

if [[ ! -z "$OIDC_ISSUER" ]]; then
  replace_envs_oidc_issuer
fi

if [[ ! -z "$OIDC_CLIENT_ID" ]]; then
  replace_envs_oidc_client_id
fi

if [ "$1" = "run" ]; then
  exec nginx -g "daemon off;"
else
  exec "$@"
fi
