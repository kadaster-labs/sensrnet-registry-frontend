import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { ConnectionService } from './services/connection.service';

@Component({ selector: 'app-root', templateUrl: 'app.component.html' })
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private titleService: Title,
    private connectionService: ConnectionService,
  ) {
    this.setTitle('Sensorenregister');
  }

  async ngOnInit() {
    await this.connectionService.refreshClaim();
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }
}
