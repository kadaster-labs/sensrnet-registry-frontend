import { APP_INITIALIZER, NgModule } from '@angular/core';
import { AuthModule, OidcConfigService } from 'angular-auth-oidc-client';
import { EnvService } from '../services/env.service';

export function configureAuth(oidcConfigService: OidcConfigService, envService: EnvService): () => Promise<any> {
  return () =>
    oidcConfigService.withConfig({
      stsServer: `https://login.microsoftonline.com/${this.envService.tenantId}/v2.0`,
      authWellknownEndpoint: 'https://login.microsoftonline.com/common/v2.0',
      redirectUrl: window.location.origin,
      postLogoutRedirectUri: window.location.origin,
      clientId: `${envService.clientId}`,
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
      deps: [OidcConfigService, EnvService],
      multi: true,
    },
  ],
})
export class AuthConfigModule { }
