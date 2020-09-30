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

  public async logout() {
    await this.connectionService.disconnectSocket();
    await this.connectionService.logout();
    await this.router.navigate(['/login']);
  }
}
