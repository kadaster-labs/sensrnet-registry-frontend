import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { ConnectionService } from '../services/connection.service';

@Component({
  styleUrls: ['./login.component.scss'],
  templateUrl: 'login.component.html',
})
export class LoginComponent {
  public loading = false;
  public submitted = false;
  public returnUrl: string;

  public loginFailedMessage = $localize`:@@login.failed:Failed to login: Supply valid credentials.`;

  constructor() { }
}
