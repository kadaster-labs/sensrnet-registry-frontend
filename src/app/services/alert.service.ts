import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AlertService {
    private subject = new Subject<any>();
    private keepAfterRouteChange = false;

    constructor(private router: Router) {
        // clear alert messages on route change unless 'keepAfterRouteChange' flag is true
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                if (this.keepAfterRouteChange) {
                    // only keep for a single route change
                    this.keepAfterRouteChange = false;
                } else {
                    // clear alert message
                    this.clear();
                }
            }
        });
    }

    public getAlert(): Observable<any> {
        return this.subject.asObservable();
    }

    public success(message: string, keepAfterRouteChange = false, timeoutDuration = 4000) {
        this.keepAfterRouteChange = keepAfterRouteChange;
        this.subject.next({ type: 'success', text: message });

        if (timeoutDuration) {
            setTimeout(() => {
                this.clear();
            }, timeoutDuration);
        }
    }

    public warning(message: string, keepAfterRouteChange = false, timeoutDuration = 4000) {
        this.keepAfterRouteChange = keepAfterRouteChange;
        this.subject.next({ type: 'warning', text: message });

        if (timeoutDuration) {
            setTimeout(() => {
                this.clear();
            }, timeoutDuration);
        }
    }

    public error(message: string, keepAfterRouteChange = false, timeoutDuration = 4000) {
        this.keepAfterRouteChange = keepAfterRouteChange;
        this.subject.next({ type: 'error', text: message });

        if (timeoutDuration) {
            setTimeout(() => {
                this.clear();
            }, timeoutDuration);
        }
    }

    public clear() {
        // clear by calling subject.next() without parameters
        this.subject.next();
    }
}
