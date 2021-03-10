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

replace_envs_oidc_issuer_url () {
  for dir in /usr/share/nginx/html/*/
  do
    sed -i "s@window.__env.oidc_issuer_url = ''@window.__env.oidc_issuer_url = '${OIDC_ISSUER_URL}'@" ${dir}env.js
  done
}

replace_envs_oidc_well_known () {
  for dir in /usr/share/nginx/html/*/
  do
    sed -i "s@window.__env.oidc_well_known = ''@window.__env.oidc_well_known = '${OIDC_WELL_KNOWN}'@" ${dir}env.js
  done
}

replace_envs_oidc_client_id () {
  for dir in /usr/share/nginx/html/*/
  do
    sed -i "s@window.__env.oidc_client_id = ''@window.__env.oidc_client_id = '${OIDC_CLIENT_ID}'@" ${dir}env.js
  done
}

if [[ ! -z "$API_URL" ]]; then
  replace_envs
fi

if [[ ! -z "$OIDC_ISSUER_URL" ]]; then
  replace_envs_oidc_issuer_url
fi

if [[ ! -z "$OIDC_WELL_KNOWN" ]]; then
  replace_envs_oidc_well_known
fi


if [[ ! -z "$OIDC_CLIENT_ID" ]]; then
  replace_envs_oidc_client_id
fi

if [ "$1" = "run" ]; then
  exec nginx -g "daemon off;"
else
  exec "$@"
fi
