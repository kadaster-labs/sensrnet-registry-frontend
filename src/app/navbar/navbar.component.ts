import { Router } from '@angular/router';
import {Component, Input} from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavBarComponent {

  @Input() locationClass;

  public environment = environment;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
  ) {}

  public async logout() {
    await this.authenticationService.logout();
    await this.router.navigate(['/login']);
  }
}
