(function (window) {
  window.__env = window.__env || {};
  // these placeholders are actually used to find and replace to set enviroment variables.
  // DO NOT CHANGE!!
  window.__env.apiUrl = 'api';
  window.__env.oidcIssuer = '/dex';
  window.__env.oidcClientId = 'registry-frontend';
}(this));
