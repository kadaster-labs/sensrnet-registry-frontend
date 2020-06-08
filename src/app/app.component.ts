import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { User } from './model/user';
import { AuthenticationService } from './services/authentication.service';

@Component({ selector: 'app-root', templateUrl: 'app.component.html' })
export class AppComponent {
    public currentUser: User;

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
    ) {
        this.authenticationService.currentUser.subscribe((x) => this.currentUser = x);
    }

    public logout() {
        this.authenticationService.logout();
        this.router.navigate(['/login']);
    }
}
