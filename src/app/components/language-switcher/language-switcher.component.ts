import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
})
export class LanguageSwitcherComponent {
  allLanguages = [{
    lang: 'en',
    name: 'English'
  }, {
    lang: 'nl',
    name: 'Nederlands'
  }];

  constructor(
    private router: Router,
  ) {}

  getCurrentRoute() {
    return this.router.url;
  }
}
