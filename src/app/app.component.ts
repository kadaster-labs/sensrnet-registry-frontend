import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { Owner } from './model/owner';
import { environment } from '../environments/environment';
import { ConnectionService } from './services/connection.service';


@Component({ selector: 'app-root', templateUrl: 'app.component.html' })
export class AppComponent {
  public currentOwner: Owner;

  constructor(
    private router: Router,
    private titleService: Title,
    private connectionService: ConnectionService,
  ) {
    this.connectionService.currentOwner.subscribe((x) => this.currentOwner = x);
    this.setTitle('Sensorenregister');
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }
}
