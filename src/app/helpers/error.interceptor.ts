import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';

import { ConnectionService } from '../services/connection.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private refreshInProgress = false;
  private refreshSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  constructor(
    private connectionService: ConnectionService,
    private router: Router,
  ) {}

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    return next.handle(request).pipe(catchError(async (error) => {
      if (request.url.includes('login') || request.url.includes('refresh')) {

        if (request.url.includes('refresh')) {
          await this.connectionService.logout();
        }

        return throwError(error);
      }

      if (error.status !== 401) {
        return throwError(error);
      }

      if (this.refreshInProgress) {
        return this.refreshSubject.pipe(
          filter(result => result !== null),
          take(1),
          switchMap(() => {
            // refresh token
            const currentOwner = this.connectionService.currentOwnerValue;
            if (currentOwner && currentOwner.access_token) {
              request = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${currentOwner.access_token}`,
                },
              });
            }

            return next.handle(request);
          })
        );
      } else {
        this.refreshInProgress = true;

        this.refreshSubject.next(null);

        return this.connectionService
          .refreshAccessToken()
          .pipe(
            switchMap((token: any) => {
              this.refreshInProgress = false;

              this.refreshSubject.next(token);

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
            }),
            catchError(async (authError: any) => {
              this.refreshInProgress = false;

              await this.connectionService.disconnectSocket();
              await this.connectionService.logout();
              await this.router.navigate(['/login']);

              return throwError(authError);
            })
          );
      }
    }));
  }
}
