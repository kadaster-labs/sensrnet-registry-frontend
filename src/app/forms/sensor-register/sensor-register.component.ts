import { Component, OnInit } from '@angular/core';
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
  public submitted = false;
  public activeStepIndex = 0;

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

  public setName(item: string) {
    this.form.controls.name.setValue(item);
  }

  public goToStep(step: number): void {
    if (Object.values(this.formControlSteps)[this.activeStepIndex].some((f) => f.invalid)) {
      if (step <= this.activeStepIndex) {
        this.activeStepIndex = step;
      } else {
        this.submitted = true;
      }
    } else {
      this.submitted = false;
      this.activeStepIndex = step;
    }
  }

  public getStepCount(): number {
    return Object.keys(this.formControlSteps).length;
  }

  public getStepLabel(): string {
    return Object.keys(this.formControlSteps)[this.activeStepIndex];
  }

  public getStepClasses(pageIndex: number) {
    return { active: this.activeStepIndex === pageIndex, finished: this.activeStepIndex > pageIndex };
  }

  public findInvalidControlsRecursive(formToInvestigate: FormGroup|FormArray): string[] {
    const invalidControls: string[] = [];
    const recursiveFunc = (form: FormGroup|FormArray) => {
      Object.keys(form.controls).forEach(field => {
        const control = form.get(field);
        if (control.invalid) {
          invalidControls.push(field);
        }
        if (control instanceof FormGroup) {
          recursiveFunc(control);
        } else if (control instanceof FormArray) {
          recursiveFunc(control);
        }
      });
    };
    recursiveFunc(formToInvestigate);

    return invalidControls;
  }

  public async submit() {
    this.submitted = true;

    // stop if form is invalid
    if (this.form.valid) {
      const dataStreams = [];
      const formDataStreams = this.form.value.dataStreams || [];
      for (const dataStream of formDataStreams) {
        dataStreams.push({
          name: dataStream.name,
          reason: dataStream.reason || undefined,
          description: dataStream.description || undefined,
          observedProperty: dataStream.observedProperty || undefined,
          isPublic: dataStream.isPublic,
          isOpenData: dataStream.isOpenData,
          isReusable: dataStream.isReusable,
          documentationUrl: dataStream.documentationUrl || undefined,
          dataLink: dataStream.dataLink || undefined,
          unitOfMeasurement: dataStream.unitOfMeasurement || undefined,
          dataFrequency: dataStream.dataFrequency,
          dataQuality: dataStream.dataQuality,
        });
      }

      const sensor: IRegisterSensorBody = {
        dataStreams,
        typeName: this.form.value.type.typeName,
        location: this.form.value.location || {},
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
      console.error(this.findInvalidControlsRecursive(this.form));
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
      'Sensor Properties': [
        this.form.controls.name,
        this.form.controls.type,
        this.form.controls.active,
      ], 'Optional Sensor Properties': [
        this.form.controls.aim,
        this.form.controls.description,
        this.form.controls.manufacturer,
        this.form.controls.documentationUrl,
        this.form.controls.theme,
      ], 'Data Streams': [
        this.form.controls.dataStreams,
      ], 'Sensor Location': [
        this.form.controls.location,
    ]};
  }
}
