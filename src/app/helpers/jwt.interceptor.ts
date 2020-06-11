import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../services/authentication.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthenticationService) { }

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with jwt token if available
    const currentOwner = this.authenticationService.currentOwnerValue;
    if (currentOwner && currentOwner.access_token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentOwner.access_token}`,
        },
      });
    }

    return next.handle(request);
  }
}
