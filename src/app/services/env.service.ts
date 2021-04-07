export class EnvService {

  // The values that are defined here are the default values that can
  // be overridden by env.js

  // API url
  public apiUrl = '';

  // issuer endpoint
  public oidcIssuer = '';

  // well known endpoint (in case it is at non default location)
  public oidcWellKnown = '';

  // client name
  public oidcClientId = '';

  constructor() {
  }

}
