import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private oidcSecurityService: OidcSecurityService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ensure we send the token only to routes which are secured
    const { secureRoutes } = this.oidcSecurityService.configuration.configuration;

    if (!secureRoutes) {
      return next.handle(req);
    }

    const matchingRoute = secureRoutes.find((x) => req.url.startsWith(x));

    if (!matchingRoute) {
      return next.handle(req);
    }

    const token = this.oidcSecurityService.getIdToken();

    if (!token) {
      return next.handle(req);
    }

    req = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + token),
    });

    return next.handle(req);
  }
}
