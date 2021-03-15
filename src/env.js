(function (window) {
  window.__env = window.__env || {};
  // these placeholders are actually used to find and replace to set enviroment variables.
  // DO NOT CHANGE!!
  window.__env.apiUrl = 'api';
  window.__env.oidc_issuer = '/dex';
  window.__env.oidc_well_known = '/dex';
  window.__env.oidc_client_id = 'registry-frontend';
}(this));
