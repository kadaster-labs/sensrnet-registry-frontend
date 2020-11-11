import { first } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { AlertService } from '../services/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConnectionService } from '../services/connection.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  styleUrls: ['./login.component.scss'],
  templateUrl: 'login.component.html',
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public loading = false;
  public submitted = false;
  public returnUrl: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private connectionService: ConnectionService,
  ) {
    const claim = this.connectionService.currentClaim;
    if (claim && claim.accessToken) {
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
        () => {
          this.alertService.error(`Failed to login: Supply valid credentials.`);
          this.loading = false;
        });
  }
}
