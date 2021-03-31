import { IContactDetails, ILegalEntity } from '../../model/legalEntity';
import { UserService } from '../../services/user.service';
import { AlertService } from '../../services/alert.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { UserUpdateBody } from '../../model/bodies/user-update';
import { LegalEntityService } from '../../services/legal-entity.service';
import { ConnectionService } from '../../services/connection.service';

@Component({
  selector: 'app-organization-update',
  templateUrl: './organization-update.component.html',
  styleUrls: ['./organization-update.component.scss']
})
export class OrganizationUpdateComponent implements OnInit {
  @Input() public legalEntity: ILegalEntity;
  @Output() setLegalEntityId = new EventEmitter<string>();

  public form: FormGroup;
  public submitted = false;

  public urlRegex = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*([/#!?=\\w]+)?';
  public updateSuccessMessage = $localize`:@@organization.update:Updated the organization.`;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly userService: UserService,
    private readonly alertService: AlertService,
    private readonly connectionService: ConnectionService,
    private readonly legalEntityService: LegalEntityService,
  ) { }

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    let contactName;
    let contactPhone;
    let contactEmail;
    if (this.legalEntity && this.legalEntity.contactDetails && this.legalEntity.contactDetails.length) {
      if (this.legalEntity.contactDetails[0].name) {
        contactName = this.legalEntity.contactDetails[0].name;
      }
      if (this.legalEntity.contactDetails[0].phone) {
        contactPhone = this.legalEntity.contactDetails[0].phone;
      }
      if (this.legalEntity.contactDetails[0].email) {
        contactEmail = this.legalEntity.contactDetails[0].email;
      }
    }

    this.form = this.formBuilder.group({
      name: [this.legalEntity ? this.legalEntity.name : null, [Validators.required]],
      website: [this.legalEntity ? this.legalEntity.website : null, [Validators.pattern(this.urlRegex)]],
      contactName: [contactName],
      contactPhone: [contactPhone],
      contactEmail: [contactEmail, [Validators.email]],
    });
  }

  public async leave() {
    const userUpdate: UserUpdateBody = {
      leaveLegalEntity: true,
    };
    try {
      await this.userService.update(userUpdate).toPromise();

      this.setLegalEntityId.emit(null);
      this.connectionService.updateSocketLegalEntity(null);
    } catch (e) {
      this.alertService.error(e.error.message);
    }
  }

  public async submit() {
    this.submitted = true;
    if (!this.form.invalid) {
      const legalEntityUpdate: Record<string, any> = {};
      if (this.form.controls.name.dirty) {
        legalEntityUpdate.name = this.form.value.name;
      }
      if (this.form.controls.website.dirty) {
        legalEntityUpdate.website = this.form.value.website;
      }

      const contactDetailsUpdate: Record<string, any> = {};
      if (this.form.controls.contactName.dirty) {
        contactDetailsUpdate.name = this.form.value.contactName;
      }
      if (this.form.controls.contactPhone.dirty) {
        contactDetailsUpdate.phone = this.form.value.contactPhone;
      }
      if (this.form.controls.contactEmail.dirty) {
        contactDetailsUpdate.email = this.form.value.contactEmail;
      }

      try {
        if (Object.keys(legalEntityUpdate).length) {
          await this.legalEntityService.update(legalEntityUpdate as ILegalEntity).toPromise();
        }
        if (Object.keys(contactDetailsUpdate).length) {
          let contactDetailsId;
          if (this.legalEntity && this.legalEntity.contactDetails && this.legalEntity.contactDetails.length) {
            contactDetailsId = this.legalEntity.contactDetails[0]._id;
            await this.legalEntityService.updateContactDetails(contactDetailsId, contactDetailsUpdate as IContactDetails).toPromise();
          }
        }

        this.alertService.success(this.updateSuccessMessage);
      } catch (e) {
        this.alertService.error(e.error.message);
      }
      this.submitted = false;
    }
  }
}
