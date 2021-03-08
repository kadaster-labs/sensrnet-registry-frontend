import { UserService } from '../../services/user.service';
import { AlertService } from '../../services/alert.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { OrganizationId } from '../../model/bodies/organization-id';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConnectionService } from '../../services/connection.service';
import { OrganizationService } from '../../services/organization.service';
import { Router } from '@angular/router';

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

  public registerFailedMessage = $localize`:@@register.failed:Failed to register. Does the organization exist already?`;

  constructor(
    private readonly router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly userService: UserService,
    private readonly alertService: AlertService,
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
          await this.connectionService.refreshToken();
          this.connectionService.updateSocketOrganization();
          this.router.navigate(['/viewer']);
        }
      } catch {
        this.alertService.error(this.registerFailedMessage);
      }
    }
    this.submitted = false;
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required]],
      website: ['', [Validators.pattern(this.urlRegex)]],
      contactName: [''],
      contactPhone: [''],
      contactEmail: ['', [Validators.email]],
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
