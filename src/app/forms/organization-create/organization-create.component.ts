import { UserService } from '../../services/user.service';
import { AlertService } from '../../services/alert.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { OrganizationId } from '../../model/bodies/organization-id';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConnectionService } from '../../services/connection.service';
import { OrganizationService } from '../../services/organization.service';

@Component({
  selector: 'app-organization-create',
  templateUrl: './organization-create.component.html',
  styleUrls: ['./organization-create.component.scss']
})
export class OrganizationCreateComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public submitted = false;

  public subscriptions = [];

  public urlRegex = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

  constructor(
    private alertService: AlertService,
    private readonly formBuilder: FormBuilder,
    private readonly userService: UserService,
    private readonly connectionService: ConnectionService,
    private readonly organizationService: OrganizationService,
  ) {}

  get f() {
    return this.form.controls;
  }

  public async submit() {
    this.submitted = true;
    if (this.form.valid) {
      try {
        const result = await this.organizationService.register(this.form.value).toPromise() as OrganizationId;

        if (result && result.organizationId) {
          await this.userService.update({organization: result.organizationId}).toPromise();
          await this.connectionService.refreshClaim();
        }
      } catch (error) {
        this.alertService.error(error.message);
      }
    }
    this.submitted = false;
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      website: ['', [Validators.required, Validators.pattern(this.urlRegex)]],
      contactName: [''],
      contactPhone: [''],
      contactEmail: ['', [Validators.email]],
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
