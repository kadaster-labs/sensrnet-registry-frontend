import { Component, OnDestroy, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { urlRegex } from '../../helpers/form.helpers';
import { AlertService } from '../../services/alert.service';
import {
    IObservationGoal,
    IRegisterObservationGoalBody,
    IUpdateObservationGoalBody,
    ObservationGoalService,
} from '../../services/observation-goal.service';

@Component({
    selector: 'app-observation-goal',
    templateUrl: './observation-goal.component.html',
    styleUrls: ['./observation-goal.component.scss'],
})
export class ObservationGoalComponent implements OnInit, OnDestroy {
    public observationGoalId: string;

    public form: FormGroup;
    public submitted = false;
    public subscriptions = [];

    constructor(
        private readonly route: ActivatedRoute,
        private readonly formBuilder: FormBuilder,
        private readonly alertService: AlertService,
        private readonly observationGoalService: ObservationGoalService,
    ) {}

    get f() {
        return this.form.controls;
    }

    public async saveObservationGoal() {
        const observationGoalBody: IRegisterObservationGoalBody = {
            name: this.form.value.name,
            description: this.form.value.description,
            legalGround: this.form.value.legalGround,
            legalGroundLink: this.form.value.legalGroundLink,
        };

        try {
            const result = (await this.observationGoalService.register(observationGoalBody).toPromise()) as Record<
                string,
                any
            >;
            this.alertService.success('Registered!');

            this.form.markAsPristine();
            this.observationGoalId = result.observationGoalId;
        } catch (e) {
            this.alertService.error(e.error.message);
        }
    }

    public async updateObservationGoal() {
        const observationGoalBody: IUpdateObservationGoalBody = {};
        if (this.form.controls.name.dirty) {
            observationGoalBody.name = this.form.value.name;
        }
        if (this.form.controls.description.dirty) {
            observationGoalBody.description = this.form.value.description;
        }
        if (this.form.controls.legalGround.dirty) {
            observationGoalBody.legalGround = this.form.value.legalGround;
        }
        if (this.form.controls.legalGroundLink.dirty) {
            observationGoalBody.legalGroundLink = this.form.value.legalGroundLink;
        }

        try {
            await this.observationGoalService.update(this.observationGoalId, observationGoalBody).toPromise();
            this.alertService.success('Updated!');

            this.form.markAsPristine();
        } catch (e) {
            this.alertService.error(e.error.message);
        }
    }

    public async submit() {
        this.submitted = true;

        if (this.form.valid) {
            if (this.observationGoalId) {
                await this.updateObservationGoal();
            } else {
                await this.saveObservationGoal();
            }
        }
    }

    public async setObservationGoal(observationGoal: IObservationGoal): Promise<void> {
        this.form.patchValue({
            id: observationGoal._id,
            name: observationGoal.name || null,
            description: observationGoal.description || null,
            legalGround: observationGoal.legalGround || null,
            legalGroundLink: observationGoal.legalGroundLink || null,
        });
        this.form.markAsPristine();
    }

    public ngOnInit() {
        this.form = this.formBuilder.group({
            id: null,
            name: [null, [Validators.required, Validators.minLength(4)]],
            description: [null, [Validators.required]],
            legalGround: null,
            legalGroundLink: [null, [Validators.pattern(urlRegex)]],
        });

        this.subscriptions.push(
            this.route.params.subscribe(async (params) => {
                if (params.id) {
                    const observationGoal = await this.observationGoalService.get(params.id).toPromise();
                    if (observationGoal) {
                        this.observationGoalId = params.id;
                        await this.setObservationGoal(observationGoal as IObservationGoal);
                    }
                }
            }),
        );
    }

    public ngOnDestroy(): void {
        this.subscriptions.forEach((x) => x.unsubscribe());
    }
}
