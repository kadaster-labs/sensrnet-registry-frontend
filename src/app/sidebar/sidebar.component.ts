import { Component } from '@angular/core';
import { ConnectionService } from '../services/connection.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  constructor(
    private connectionService: ConnectionService,
    private router: Router,
  ) {}

  public async logout() {
    await this.connectionService.disconnectSocket();
    await this.connectionService.logout();
    await this.router.navigate(['/login']);
  }
}
