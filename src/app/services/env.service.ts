export class EnvService {

  // The values that are defined here are the default values that can
  // be overridden by env.js

  // API url
  public apiUrl = '';

  // tenant Id for OpenID connect (currently only AzureAD)
  public tenantId = '';

  // client Id for OpenID connect (currently only AzureAD)
  public clientId = '';

  constructor() {
  }

}
