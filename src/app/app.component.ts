import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Owner } from './model/owner';
import { AuthenticationService } from './services/authentication.service';
import { Title } from '@angular/platform-browser';
import { environment } from '../environments/environment';

@Component({ selector: 'app-root', templateUrl: 'app.component.html' })
export class AppComponent {
  public currentOwner: Owner;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private titleService: Title,
  ) {
    this.authenticationService.currentOwner.subscribe((x) => this.currentOwner = x);
    this.setTitle(environment.clientName);
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  public logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }
}
