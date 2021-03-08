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
      if (request.url.includes('login')) {
        return throwError(error);
      } else if (request.url.includes('refresh')) {
        return await this.connectionService.logout();
      }

      if (error.status !== 401) {
        throw new Error(error);
      }

      if (this.refreshInProgress) {
        return this.refreshSubject.pipe(
          filter(result => result !== null),
          take(1),
          switchMap(() => {
            // refresh token
            const claim = this.connectionService.currentClaims;
            if (claim && claim.access_token) {
              request = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${claim.access_token}`,
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
          const claim = await this.connectionService.refreshToken();

          this.refreshSubject.next(claim);
          this.refreshInProgress = false;

          return next.handle(request).toPromise();
        } catch (e) {
          this.refreshInProgress = false;

          return throwError(e);
        }
      }
    }));
  }
}
