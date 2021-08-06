import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectionService } from '../services/connection.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    constructor(private router: Router, private connectionService: ConnectionService) {}

    public async logout() {
        await this.connectionService.logoutRedirect();
    }
}
