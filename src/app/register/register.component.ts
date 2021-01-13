import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {UserService} from '../services/user.service';
import { AlertService } from '../services/alert.service';
import { ConnectionService } from '../services/connection.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  styleUrls: ['./register.component.scss'],
  templateUrl: 'register.component.html',
})
export class RegisterComponent implements OnInit {
  public loading = false;
  public submitted = false;
  public registerForm: FormGroup;

  public registerSuccessMessage = $localize`:@@register.success:Registration successful`;
  public registerFailedMessage = $localize`:@@register.failure:Registration failed. Does the account exist already?`;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private alertService: AlertService,
    private connectionService: ConnectionService,
  ) {
    const claim = this.connectionService.currentClaim;
    if (claim && claim.accessToken) {
      this.router.navigate(['/']);
    }
  }

  public ngOnInit() {
    const reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
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
    this.userService.register(this.registerForm.value)
      .pipe(first())
      .subscribe(
        () => {
          this.alertService.success(this.registerSuccessMessage, true);
          this.router.navigate(['/login']);
        },
        () => {
          this.alertService.error(this.registerFailedMessage);
          this.loading = false;
        });
  }
}
