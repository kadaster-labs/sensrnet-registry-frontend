# Logging in with Azure AD accounts
Following
[sensrnet-home#70](https://github.com/kadaster-labs/sensrnet-home/issues/70),
the user system has been decoupled from the SensRNet app. Organization will have
to bring their own (OpenID Connect complient) user management system, which they
can plugin into SenSRNet. This brings benefits for governance and security, and
simplifies as our code.

It is important to emphasize that, while the repositories are called backend and
frontend, the components are actually decoupled; and SPA and API. For this
reason, the best fitting authentication flow is the Authorization Flow with PKCE
extension. The end-user is therefore logged in within the Angular SPA. The
authenticated user gets an id_token from the OpenID Connect provider. This token
can then be consumed by our API.

![Overview](./overview.PNG)
