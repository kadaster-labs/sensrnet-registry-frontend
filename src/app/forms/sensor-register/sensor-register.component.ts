import { Component, OnInit, Input } from '@angular/core';
import { AlertService } from '../../services/alert.service';
import { LocationService } from '../../services/location.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { IRegisterSensorBody, SensorService } from '../../services/sensor.service';

@Component({
  selector: 'app-sensor-register',
  templateUrl: './sensor-register.component.html',
  styleUrls: ['./sensor-register.component.scss'],
})
export class SensorRegisterComponent implements OnInit {
  @Input() public active = false;

  public activeStepIndex = 0;
  public stepSubmitted = false;

  public form: FormGroup;
  public formControlSteps: Array<Array<any>>;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly alertService: AlertService,
    private readonly sensorService: SensorService,
    private readonly locationService: LocationService,
  ) {}

  get f() {
    return this.form.controls;
  }

  get totalSteps() {
    return this.formControlSteps.length;
  }

  setName(item: string) {
    this.form.controls.name.setValue(item);
  }

  public goToStep(step: string): void {
    if (this.formControlSteps[this.activeStepIndex].some((f) => f.invalid)) {
      if (step === 'prev') {
        this.activeStepIndex -= 1;
      } else {
        this.stepSubmitted = true;
      }
    } else {
      this.stepSubmitted = false;
      this.activeStepIndex = step === 'prev' ? this.activeStepIndex - 1 : this.activeStepIndex + 1;
    }
  }

  public resetForm() {
    this.activeStepIndex = 0;
    this.stepSubmitted = false;
  }

  public getClasses(pageIndex: number) {
    return {
      active: this.activeStepIndex === pageIndex,
      finished: this.activeStepIndex > pageIndex,
    };
  }

  public async submit() {
    this.stepSubmitted = true;

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    const sensor: IRegisterSensorBody = {
      typeName: this.form.value.type.typeName,
      location: this.form.value.location || {},
      dataStreams: this.form.value.dataStreams || [],
      active: JSON.parse(this.form.value.active.value.toLowerCase()) || false, // cast strings (i.e. "true") to boolean
      aim: this.form.value.aim,
      description: this.form.value.description,
      documentationUrl: this.form.value.documentationUrl,
      manufacturer: this.form.value.manufacturer,
      name: this.form.value.name,
      theme: this.form.value.theme.value || [],
      typeDetails: { subType: this.form.value.type.typeDetails || '' },
    };

    try {
      await this.sensorService.register(sensor);
      this.locationService.showLocation(null);

      this.resetForm();
      this.alertService.success('Created sensor', false, 5000);
    } catch (error) {
      console.log(`An error has occurred while creating sensor: ${error}`);
    }
  }

  public ngOnInit() {
    const reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

    this.form = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(6)]],
      aim: '',
      description: '',
      manufacturer: ['', Validators.required],
      active: '',
      documentationUrl: ['', [Validators.required, Validators.pattern(reg)]],
      location: [],
      type: [],
      theme: [],
    });

    this.formControlSteps = [
      [this.form.controls.name, this.form.controls.type],
      [this.form.controls.aim, this.form.controls.description, this.form.controls.active],
      [this.form.controls.manufacturer, this.form.controls.documentationUrl, this.form.controls.theme],
      [this.form.controls.location],
    ];
  }
}
