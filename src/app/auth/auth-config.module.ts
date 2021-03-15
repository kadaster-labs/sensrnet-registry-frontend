import { APP_INITIALIZER, NgModule } from '@angular/core';
import { AuthModule, OidcConfigService, LogLevel } from 'angular-auth-oidc-client';
import { EnvService } from '../services/env.service';
import { environment } from '../../environments/environment';

export function configureAuth(oidcConfigService: OidcConfigService, envService: EnvService): () => Promise<any> {
  return () =>
    oidcConfigService.withConfig({
      stsServer: envService.oidc_issuer,
      authWellknownEndpoint: envService.oidc_well_known,
      redirectUrl: window.location.origin,
      postLogoutRedirectUri: window.location.origin,
      clientId: envService.oidc_client_id,
      scope: 'openid profile email',
      responseType: 'id_token token',
      silentRenew: true,
      silentRenewUrl: window.location.origin + '/silent-renew.html',
      renewTimeBeforeTokenExpiresInSeconds: 10,
      secureRoutes: [ // where to send the id token to
        envService.apiUrl,
      ],
      logLevel: environment.production ? LogLevel.None : LogLevel.Debug,
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
