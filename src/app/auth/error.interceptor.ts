import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ConnectionService } from '../services/connection.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private connectionService: ConnectionService) {}

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
        return next.handle(request).pipe(
            catchError(async (error) => {
                if (error.status === 401) {
                    this.connectionService.logoutRedirect();
                }

                if (error.status !== 401) {
                    if (error.status === 403) {
                        error.error.message = `You do not have the required rights to perform this operation`;
                    }

                    throw error;
                }

                return next.handle(request);
            }),
        );
    }
}
