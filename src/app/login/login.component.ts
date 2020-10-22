import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { AlertService } from '../services/alert.service';
import { ConnectionService } from '../services/connection.service';
import { environment } from '../../environments/environment';

@Component({
  styleUrls: ['./login.component.scss'],
  templateUrl: 'login.component.html',
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public loading = false;
  public submitted = false;
  public returnUrl: string;

  public environment = environment;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private connectionService: ConnectionService,
    private alertService: AlertService,
  ) {
    // redirect to home if already logged in
    if (this.connectionService.currentOwnerValue) {
      this.router.navigate(['/']);
    }
  }

  public ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  public onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.connectionService.login(this.f.username.value, this.f.password.value)
      .pipe(first())
      .subscribe(
        () => {
          this.router.navigate([this.returnUrl]);
        },
        (e) => {
          console.log(e);
          this.alertService.error(`Failed to login: Supply valid credentials.`);
          this.loading = false;
        });
  }
}
