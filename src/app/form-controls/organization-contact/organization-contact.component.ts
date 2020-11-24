import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-organization-contact',
  templateUrl: './organization-contact.component.html',
  styleUrls: ['./organization-contact.component.scss'],
})
export class OrganizationContactComponent {
  @Input() public submitted: boolean;
  @Input() public parentForm: FormGroup;

  get f() {
    return this.parentForm;
  }
}
