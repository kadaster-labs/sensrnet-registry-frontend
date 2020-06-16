import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { AlertService } from '../services/alert.service';
import { AuthenticationService } from '../services/authentication.service';
import { OwnerService } from '../services/owner.service';

@Component({
  styleUrls: ['./register.component.css'],
  templateUrl: 'register.component.html',
})
export class RegisterComponent implements OnInit {
  public registerForm: FormGroup;
  public loading = false;
  public submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private ownerService: OwnerService,
    private alertService: AlertService,
  ) {
    // redirect to viewer if already logged in
    if (this.authenticationService.currentOwnerValue) {
      this.router.navigate(['/']);
    }
  }

  public ngOnInit() {
    this.registerForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],

      name: ['', Validators.required],
      role: ['', Validators.required],
      organization: ['', Validators.required],
      contactEmail: ['', Validators.required],
      contactPhone: ['', Validators.required],
      website: ['', Validators.required],
    });
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.registerForm.controls;
  }

  public onSubmit() {
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
        (data) => {
          this.alertService.success('Registration successful', true);
          this.router.navigate(['/login']);
        },
        (error) => {
          this.alertService.error(error);
          this.loading = false;
        });
  }
}
