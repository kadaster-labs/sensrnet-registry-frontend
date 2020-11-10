import { AlertService } from '../../services/alert.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { OrganizationService } from '../../services/organization.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {Organization} from '../../model/organization';
import {UserService} from '../../services/user.service';
import {ConnectionService} from '../../services/connection.service';

@Component({
  selector: 'app-organization-join',
  templateUrl: './organization-join.component.html',
  styleUrls: ['./organization-join.component.scss']
})
export class OrganizationJoinComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public submitted = false;

  public subscriptions = [];
  public organizations = [];

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

  async ngOnInit(): Promise<void> {
    this.form = this.formBuilder.group({
      organization: new FormControl('', Validators.required),
    });

    const organizationPromise = this.organizationService.getAll().toPromise();
    const organizations = await organizationPromise;
    if (organizations) {
      this.organizations = organizations as Organization[];
    } else {
      this.organizations = [];
    }
  }

  public async submit() {
    this.submitted = true;
    if (this.form.valid) {
      try {
        await this.userService.update(this.form.value).toPromise();
        await this.connectionService.refreshClaim();

        this.alertService.success('Updated.', false, 4000);
      } catch (error) {
        this.alertService.error(error.message);
      }
    }
    this.submitted = false;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
