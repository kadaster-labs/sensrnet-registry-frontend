import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Owner } from './model/owner';
import { AuthenticationService } from './services/authentication.service';

@Component({ selector: 'app-root', templateUrl: 'app.component.html' })
export class AppComponent {
  public currentOwner: Owner;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
  ) {
    this.authenticationService.currentOwner.subscribe((x) => this.currentOwner = x);
  }

  public logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }
}
