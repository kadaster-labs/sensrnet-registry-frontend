import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { ConnectionService } from '../services/connection.service';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private refreshInProgress = false;
  private refreshSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private router: Router,
    private connectionService: ConnectionService,
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
            const currentOwner = this.connectionService.currentClaim;
            if (currentOwner && currentOwner.accessToken) {
              request = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${currentOwner.accessToken}`,
                },
              });
            }

            return next.handle(request);
          })
        );
      } else {
        this.refreshInProgress = true;
        this.refreshSubject.next(null);

        try {
          const claim = await this.connectionService.refreshClaim();

          this.refreshInProgress = false;
          this.refreshSubject.next(claim);

          // add authorization header with jwt token if available
          const currentOwner = this.connectionService.currentClaim;
          if (currentOwner && currentOwner.accessToken) {
            request = request.clone({
              setHeaders: {
                Authorization: `Bearer ${currentOwner.accessToken}`,
              },
            });
          }

          return next.handle(request).toPromise();
        } catch (e) {
          this.refreshInProgress = false;

          return throwError(e);
        }
      }
    }));
  }
}
