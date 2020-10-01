import { browser, by, element } from 'protractor';

export class AppPage {
  public navigateTo(): Promise<unknown> {
    return browser.get(browser.baseUrl) as Promise<unknown>;
  }

  public getTitleText(): Promise<string> {
    return element(by.css('app-root .jumbotron h1')).getText() as Promise<string>;
  }
}
