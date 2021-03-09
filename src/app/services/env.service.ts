export class EnvService {

  // The values that are defined here are the default values that can
  // be overridden by env.js

  // API url
  public apiUrl = '';

  // tenant Id for OpenID connect (currently only AzureAD)
  public azuread_tenant_id = '';

  // client Id for OpenID connect (currently only AzureAD)
  public azuread_client_id = '';

  constructor() {
  }

}
