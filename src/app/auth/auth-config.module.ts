import { APP_INITIALIZER, NgModule } from '@angular/core';
import { AuthModule, OidcConfigService } from 'angular-auth-oidc-client';

export function configureAuth(oidcConfigService: OidcConfigService): () => Promise<any> {
  return () =>
    oidcConfigService.withConfig({
      stsServer: 'https://login.microsoftonline.com/{tenant-id}/v2.0',
      authWellknownEndpoint: 'https://login.microsoftonline.com/common/v2.0',
      redirectUrl: window.location.origin,
      postLogoutRedirectUri: window.location.origin,
      clientId: '{client-id}',
      scope: 'openid profile offline_access email',
      responseType: 'code',
      silentRenew: true,
      issValidationOff: true, // azuread
      maxIdTokenIatOffsetAllowedInSeconds: 600, // azuread
      silentRenewUrl: window.location.origin + '/silent-renew.html',
      renewTimeBeforeTokenExpiresInSeconds: 10,
      customParams: {
        prompt: 'select_account', // login, consent
      },
      secureRoutes: [ // where to send the id token to
        'api/'
      ],
    });
}

@NgModule({
  imports: [AuthModule.forRoot()],
  exports: [AuthModule],
  providers: [
    OidcConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: configureAuth,
      deps: [OidcConfigService],
      multi: true,
    },
  ],
})
export class AuthConfigModule { }
