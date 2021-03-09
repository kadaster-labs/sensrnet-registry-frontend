import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { ConnectionService } from '../services/connection.service';
import { catchError } from 'rxjs/operators';
import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private connectionService: ConnectionService,
  ) {}

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    return next.handle(request).pipe(catchError(async (error) => {
      if (error.status == 401) {
        this.connectionService.logoutRedirect();
      }

      return next.handle(request);
    }));
  }
}
