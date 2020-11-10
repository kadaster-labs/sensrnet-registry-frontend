import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { AlertService } from '../services/alert.service';
import { ConnectionService } from '../services/connection.service';
import { OwnerService } from '../services/owner.service';

@Component({
  styleUrls: ['./register.component.scss'],
  templateUrl: 'register.component.html',
})
export class RegisterComponent implements OnInit {
  public registerForm: FormGroup;
  public loading = false;
  public submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private connectionService: ConnectionService,
    private ownerService: OwnerService,
    private alertService: AlertService,
  ) {
    // redirect to viewer if already logged in
    if (this.connectionService.currentOwnerValue) {
      this.router.navigate(['/']);
    }
  }

  public ngOnInit() {
    const reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],

      name: ['', Validators.required],
      role: ['', Validators.required],
      organisationName: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', Validators.required],
      website: ['', [Validators.required, Validators.pattern(reg)]],
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.registerForm.controls;
  }

  public async onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.ownerService.register(this.registerForm.value)
      .pipe(first())
      .subscribe(
        () => {
          this.alertService.success('Registration successful', true);
          this.router.navigate(['/login']);
        },
        () => {
          this.alertService.error('Registration failed. Does the account exist already?');
          this.loading = false;
        });
  }
}
