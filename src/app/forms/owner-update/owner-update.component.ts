import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConnectionService } from '../../services/connection.service';
import { Owner } from '../../model/owner';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-owner-update',
  templateUrl: './owner-update.component.html',
  styleUrls: ['./owner-update.component.scss']
})
export class OwnerUpdateComponent implements OnInit {

  @Input() public active = false;
  @Output() public closePane = new EventEmitter<void>();

  public form: FormGroup;
  public submitted = false;
  public currentOwner: Owner;

  constructor(
    private router: Router,
    private alertService: AlertService,
    private readonly formBuilder: FormBuilder,
    private readonly connectionService: ConnectionService,
  ) {}

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    const reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

    this.form = this.formBuilder.group({
      name: [this.currentOwner ? this.currentOwner.name : '', Validators.required],
      organisationName: [this.currentOwner ? this.currentOwner.organisationName : '', Validators.required],
      contactPhone: [this.currentOwner ? this.currentOwner.contactPhone : '', Validators.required],
      contactEmail: [this.currentOwner ? this.currentOwner.contactEmail : '', [Validators.required, Validators.email]],
      website: [this.currentOwner ? this.currentOwner.website : '', [Validators.required, Validators.pattern(reg)]],
    });

    this.initFormFields();
  }

  initFormFields(): void {
    this.connectionService.getOwner();
    this.connectionService.currentOwner.subscribe((owner: Owner) => {
      this.currentOwner = owner;

      if (!owner || !this.form) {
        return;
      }

      this.form.setValue({
        name: this.currentOwner.name,
        organisationName: this.currentOwner.organisationName,
        contactPhone: this.currentOwner.contactPhone,
        contactEmail: this.currentOwner.contactEmail,
        website: this.currentOwner.website,
      });
    });
  }

  public async submit() {
    this.submitted = true;

    if (!this.form.invalid) {
      console.log(`posting ${this.form.value}`);

      try {
        await this.connectionService.updateOwner(this.form.value).toPromise();
        this.alertService.success('Updated owner');
      } catch (error) {
        this.alertService.error(error.message);
      }
    }
  }

  public async close() {
    await this.router.navigate(['']);
  }
}
