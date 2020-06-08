import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';

import { AlertService } from '../services/alert.service';
import { AuthenticationService } from '../services/authentication.service';
import { UserService } from '../services/user.service';

@Component({ templateUrl: 'register.component.html' })
export class RegisterComponent implements OnInit {
    public registerForm: FormGroup;
    public loading = false;
    public submitted = false;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private authenticationService: AuthenticationService,
        private userService: UserService,
        private alertService: AlertService,
    ) {
        // redirect to viewer if already logged in
        if (this.authenticationService.currentUserValue) {
            this.router.navigate(['/']);
        }
    }

    public ngOnInit() {
        this.registerForm = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            username: ['', Validators.required],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.registerForm.controls; }

    public onSubmit() {
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
