import { Router } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  public navItems = [];

  constructor(
    private router: Router,
  ) {
    if (this.router.url.startsWith('/owner')){
      this.initOwnerSideBar();
    } else if (this.router.url.startsWith('/sensor')) {
      this.initSensorSideBar();
    }
  }

  public initOwnerSideBar() {
    this.navItems.push({icon: 'fas fa-edit', text: 'Edit', route: '/owner'});
  }

  public initSensorSideBar() {
    this.navItems.push({icon: 'fas fa-plus-square', text: 'Register', route: '/sensor'});
    this.navItems.push({icon: 'fas fa-edit', text: 'Edit', route: '/sensor/update'});
  }
}
