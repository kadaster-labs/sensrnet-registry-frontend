import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { ConnectionService } from '../services/connection.service';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import {HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private refreshInProgress = false;
  private refreshSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private router: Router,
    private connectionService: ConnectionService,
  ) {}

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    return next.handle(request)
      .pipe(catchError(async (error) => {
        if (request.url.includes('login')) {
          return throwError(error);
        } else if (request.url.includes('refresh')) {
          return await this.connectionService.logout();
        }

        if (error.status !== 401) {
          if (error.status === 403) {
            error.message = `You do not have the required rights to perform this operation`;
          }
          console.log(error);
          throw error;
        }

        if (this.refreshInProgress) {
          return this.refreshSubject.pipe(
            filter(result => result !== null),
            take(1),
            switchMap(() => {
              // refresh token
              const claim = this.connectionService.currentClaim;
              if (claim && claim.accessToken) {
                request = request.clone({
                  setHeaders: {
                    Authorization: `Bearer ${claim.accessToken}`,
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

            this.refreshSubject.next(claim);
            this.refreshInProgress = false;

            // Add authorization header with access token if available.
            if (claim) {
              request = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${claim.accessToken}`,
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
