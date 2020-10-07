import { Component, OnInit, Input } from '@angular/core';
import { AlertService } from '../../services/alert.service';
import { LocationService } from '../../services/location.service';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
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
  public formControlSteps: Record<string, Array<any>>;

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
    return Object.keys(this.formControlSteps).length;
  }

  setName(item: string) {
    this.form.controls.name.setValue(item);
  }

  public goToStep(step: number): void {
    if (Object.values(this.formControlSteps)[this.activeStepIndex].some((f) => f.invalid)) {
      if (step <= this.activeStepIndex) {
        this.activeStepIndex = step;
      } else {
        this.stepSubmitted = true;
      }
    } else {
      this.stepSubmitted = false;
      this.activeStepIndex = step;
    }
  }

  public getStepLabel(): string {
    return Object.keys(this.formControlSteps)[this.activeStepIndex];
  }

  public getClasses(pageIndex: number) {
    return {
      active: this.activeStepIndex === pageIndex,
      finished: this.activeStepIndex > pageIndex,
    };
  }

  public async submit() {
    this.stepSubmitted = true;

    // stop if form is invalid
    if (this.form.valid) {
      const sensor: IRegisterSensorBody = {
        typeName: this.form.value.type.typeName,
        location: this.form.value.location || {},
        dataStreams: this.form.value.dataStreams || [],
        active: JSON.parse(this.form.value.active.value.toLowerCase()) || false, // cast strings ("true") to boolean
        aim: this.form.value.aim,
        description: this.form.value.description,
        documentationUrl: this.form.value.documentationUrl || undefined,
        manufacturer: this.form.value.manufacturer || undefined,
        name: this.form.value.name,
        theme: this.form.value.theme ? this.form.value.theme.value : [],
        typeDetails: { subType: this.form.value.type.typeDetails || '' },
      };

      try {
        await this.sensorService.register(sensor);
        this.locationService.showLocation(null);
        this.alertService.success('Sensor created', false, 4000);
      } catch (error) {
        this.alertService.error(`An error has occurred while creating sensor: ${error}`);
      }
    } else {
      console.log(this.form.errors);
      this.alertService.error(`The form is invalid.`);
    }
  }

  public ngOnInit() {
    const urlRegex = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

    this.form = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(6)]],
      aim: '',
      description: '',
      manufacturer: '',
      active: '',
      documentationUrl: ['', [Validators.pattern(urlRegex)]],
      dataStreams: new FormArray([]),
      location: [],
      type: [],
      theme: [],
    });

    this.formControlSteps = {
      'Required Properties': [
        this.form.controls.name,
        this.form.controls.type,
        this.form.controls.active,
      ], 'Optional Properties': [
        this.form.controls.aim,
        this.form.controls.description,
        this.form.controls.manufacturer,
        this.form.controls.documentationUrl,
        this.form.controls.theme,
      ], 'Data Streams': [
        this.form.controls.dataStreams,
      ], Location: [
      this.form.controls.location,
    ]};
  }
}
