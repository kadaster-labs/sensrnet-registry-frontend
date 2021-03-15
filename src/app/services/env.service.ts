export class EnvService {

  // The values that are defined here are the default values that can
  // be overridden by env.js

  // API url
  public apiUrl = '';

  // issuer endpoint
  public oidc_issuer = '';

  // well known endpoint (in case it is at non default location)
  public oidc_well_known = '';

  // client name
  public oidc_client_id = ''

  constructor() {
  }

}
