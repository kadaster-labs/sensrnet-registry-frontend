import { Router } from '@angular/router';
import {Component, Input} from '@angular/core';
import { ConnectionService } from '../services/connection.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavBarComponent {

  @Input() locationClass;

  constructor(
    private router: Router,
  ) {}

  public async toggleMenu() {
    if (this.router.url === '/') {
      await this.router.navigate(['/owner']);
    } else {
      await this.router.navigate(['/']);
    }
  }
}
