import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../services/authentication.service';
import { Owner } from '../model/owner';

@Component({
  selector: 'app-owner-update',
  templateUrl: './owner-update.component.html',
  styleUrls: ['./owner-update.component.scss']
})
export class OwnerUpdateComponent implements OnInit, OnChanges {

  @Input() public active = false;
  @Output() public closePane = new EventEmitter<void>();
  public form: FormGroup;
  public submitted = false;
  public success = false;
  public currentOwner: Owner;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authenticationService: AuthenticationService,
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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.active) {
      this.authenticationService.getOwner();
      this.authenticationService.currentOwner.subscribe((owner: Owner) => {
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

    if (changes.active.previousValue && !changes.active.currentValue) {
      this.submitted = false;
      this.success = false;
      this.form.markAsPristine();
    }
  }

  public async submit() {
    this.submitted = true;
    this.success = false;

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    console.log(`posting ${this.form.value}`);

    try {
      await this.authenticationService.updateOwner(this.form.value).toPromise();

      console.log('Owner was successfully updated');
      this.success = true;
    } catch (error) {
      console.log(error);
      this.success = false;
    }
  }

  public close() {
    console.log('close');
    this.closePane.emit();
  }
}
