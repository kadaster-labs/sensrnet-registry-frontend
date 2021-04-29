import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { supportedNames } from '../../validators/organization-mail.validator';

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

    const supportedDomainNamesLength = supportedNames.length;
    for (let i = 0; i < supportedDomainNamesLength; i++) {
      if (i === supportedDomainNamesLength - 1) {
        stringValue += `'${supportedNames[i]}'`;
      } else if (i === supportedDomainNamesLength - 2) {
        stringValue += `'${supportedNames[i]}' or `;
      } else {
        stringValue += `'${supportedNames[i]}', `;
      }
    }

    return stringValue;
  }

  get f() {
    return this.parentForm;
  }
}
