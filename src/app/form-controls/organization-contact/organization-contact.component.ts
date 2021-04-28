import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { supportedDomainNames } from '../../validators/organization-mail.validator';

@Component({
  selector: 'app-organization-contact',
  templateUrl: './organization-contact.component.html',
  styleUrls: ['./organization-contact.component.scss'],
})
export class OrganizationContactComponent {
  @Input() public submitted: boolean;
  @Input() public parentForm: FormGroup;

  public getSupportedDomainNamesString() {
    let stringValue = '';

    const supportedDomainNamesLength = supportedDomainNames.length;
    for (let i = 0; i < supportedDomainNamesLength; i++) {
      if (i === supportedDomainNamesLength - 1) {
        stringValue += `'${supportedDomainNames[i]}'`;
      } else if (i === supportedDomainNamesLength - 2) {
        stringValue += `'${supportedDomainNames[i]}' or `;
      } else {
        stringValue += `'${supportedDomainNames[i]}', `;
      }
    }

    return stringValue;
  }

  get f() {
    return this.parentForm;
  }
}
