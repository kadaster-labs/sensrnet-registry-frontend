import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ConnectionService } from '../services/connection.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private connectionService: ConnectionService) { }

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with jwt token if available
    const currentOwner = this.connectionService.currentOwnerValue;
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
