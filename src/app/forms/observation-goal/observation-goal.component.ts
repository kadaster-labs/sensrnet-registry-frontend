import {Validators, FormArray, FormGroup, FormBuilder} from '@angular/forms';
import { IDevice } from '../../model/bodies/device-model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {IRegisterObservationGoalBody, ObservationGoalService} from '../../services/observation-goal.service';
import {AlertService} from "../../services/alert.service";

@Component({
  selector: 'app-observation-goal',
  templateUrl: './observation-goal.component.html',
  styleUrls: ['./observation-goal.component.scss'],
})
export class ObservationGoalComponent implements OnInit, OnDestroy {

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
      await this.observationGoalService.register(observationGoalBody).toPromise();
      this.alertService.success('Registered!');
    } catch (e) {
      this.alertService.error(e.error.message);
    }
  }

  public async submit() {
    this.submitted = true;

    if (this.form.valid) {
      await this.saveObservationGoal();
    }
  }

  public ngOnInit() {
    this.form = this.formBuilder.group({
      id: null,
      name: [null, [Validators.required, Validators.minLength(6)]],
      description: [null, [Validators.required]],
      legalGround: null,
      legalGroundLink: null,
    });

    this.subscriptions.push(
      this.route.params.subscribe(async params => {
        if (params.id) {
          console.log(params);
          // const device = await this.deviceService.get(params.id).toPromise();
          // if (device) {
          //   this.deviceId = params.id;
          //   this.setDevice(device as IDevice);
          // }
          //
          // this.locationService.showLocation(null);
        }
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
  }
}
