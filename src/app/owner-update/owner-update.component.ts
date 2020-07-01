import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../services/authentication.service';
import { Owner } from '../model/owner';

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
  public success = false;
  public currentOwner: Owner;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authenticationService: AuthenticationService,
  ) {
    this.authenticationService.currentOwner.subscribe((x) => this.currentOwner = x);
    console.log(this.currentOwner);
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    const reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

    this.form = this.formBuilder.group({
      name: [this.currentOwner.name, Validators.required],
      contactEmail: [this.currentOwner.email, [Validators.required, Validators.email]],
      contactPhone: [this.currentOwner.phone, Validators.required],
      website: [this.currentOwner.website, [Validators.required, Validators.pattern(reg)]],
    });
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

      console.log('Owner was succesfully updated');
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
