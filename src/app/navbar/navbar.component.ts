import { Router } from '@angular/router';
import {Component, Input} from '@angular/core';
import { environment } from '../../environments/environment';
import { ConnectionService } from '../services/connection.service';

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
    private connectionService: ConnectionService,
  ) {}

  public async toggleMenu() {
    if (this.router.url === '/') {
      await this.router.navigate(['/owner']);
    } else {
      await this.router.navigate(['/']);
    }
  }
}
