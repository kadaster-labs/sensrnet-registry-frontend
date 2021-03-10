import { Claim } from '../../model/claim';
import { Organization } from '../../model/organization';
import { UserService } from '../../services/user.service';
import { AlertService } from '../../services/alert.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConnectionService } from '../../services/connection.service';
import { LegalEntityService } from '../../services/legal-entity.service';

@Component({
  selector: 'app-organization-update',
  templateUrl: './organization-update.component.html',
  styleUrls: ['./organization-update.component.scss']
})
export class OrganizationUpdateComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public submitted = false;
  public myOrganization: Organization;

  public subscriptions = [];

  public urlRegex = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

  public updateSuccessMessage = $localize`:@@organization.update:Updated the organization.`;

  constructor(
    private alertService: AlertService,
    private readonly formBuilder: FormBuilder,
    private readonly userService: UserService,
    private readonly connectionService: ConnectionService,
    private readonly organizationService: LegalEntityService,
  ) {}

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      website: [this.myOrganization ? this.myOrganization.website : '', [Validators.pattern(this.urlRegex)]],
      contactName: [this.myOrganization ? this.myOrganization.contactName : ''],
      contactPhone: [this.myOrganization ? this.myOrganization.contactPhone : ''],
      contactEmail: [this.myOrganization ? this.myOrganization.contactEmail : '', [Validators.email]],
    });

    this.initFormFields();
  }

  initFormFields(): void {
    this.subscriptions.push(this.connectionService.claim$.subscribe(async (claim: Claim) => {
      if (claim) {
        const organizationPromise = this.organizationService.get().toPromise();
        try {
          this.myOrganization = await organizationPromise;
        } catch {
          this.myOrganization = null;
        }
      } else {
        this.myOrganization = null;
      }

      if (this.myOrganization) {
        this.form.setValue({
          website: this.myOrganization.website,
          contactName: this.myOrganization.contactName,
          contactPhone: this.myOrganization.contactPhone,
          contactEmail: this.myOrganization.contactEmail,
        });
      } else {
        this.form.setValue({
          website: '',
          contactName: '',
          contactPhone: '',
          contactEmail: '',
        });
      }
    }));
  }

  public async leave() {
    try {
      await this.userService.update({organization: null}).toPromise();
      await this.connectionService.refreshClaim();
    } catch (error) {
      this.alertService.error(error.message);
    }
  }

  public async submit() {
    this.submitted = true;
    if (!this.form.invalid) {
      try {
        await this.organizationService.update(this.form.value).toPromise();

        this.alertService.success(this.updateSuccessMessage, false, 4000);
      } catch (error) {
        this.alertService.error(error.message);
      }
      this.submitted = false;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
