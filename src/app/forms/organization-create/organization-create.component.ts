import { UserService } from '../../services/user.service';
import { AlertService } from '../../services/alert.service';
import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import { LegalEntityId } from '../../model/bodies/legal-entity-id';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {IRegisterLegalEntityBody, LegalEntityService} from '../../services/legal-entity.service';
import {IContactDetails} from '../../model/legalEntity';
import {ConnectionService} from "../../services/connection.service";

@Component({
  selector: 'app-organization-create',
  templateUrl: './organization-create.component.html',
  styleUrls: ['./organization-create.component.scss']
})
export class OrganizationCreateComponent implements OnInit, OnDestroy {
  @Output() updateLegalEntity = new EventEmitter<boolean>();

  public form: FormGroup;
  public submitted = false;
  public subscriptions = [];

  public urlRegex = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

  public registerFailedMessage = $localize`:@@register.failed:Failed to register. Does the organization exist already?`;

  constructor(
    private alertService: AlertService,
    private readonly formBuilder: FormBuilder,
    private readonly userService: UserService,
    private readonly connectionService: ConnectionService,
    private readonly legalEntityService: LegalEntityService,
  ) {}

  get f() {
    return this.form.controls;
  }

  public async submit() {
    this.submitted = true;
    if (this.form.valid) {
      try {
        const contactDetails: IContactDetails = {
          name: this.form.value.contactName,
          email: this.form.value.contactEmail,
          phone: this.form.value.contactPhone,
        };
        const legalEntity: IRegisterLegalEntityBody = {
          name: this.form.value.name,
          website: this.form.value.website,
          contactDetails,
        };

        const result = await this.legalEntityService.register(legalEntity).toPromise() as LegalEntityId;
        if (result && result.legalEntityId) {
          this.updateLegalEntity.emit();
          this.connectionService.updateSocketLegalEntity(result.legalEntityId);
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
    this.subscriptions.forEach(x => x.unsubscribe());
  }
}
