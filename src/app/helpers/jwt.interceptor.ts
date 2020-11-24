import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ConnectionService } from '../services/connection.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private connectionService: ConnectionService) { }

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with jwt token if available
    const claim = this.connectionService.currentClaim;
    if (claim && claim.accessToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${claim.accessToken}`,
        },
      });
    }

    return next.handle(request);
  }
}
