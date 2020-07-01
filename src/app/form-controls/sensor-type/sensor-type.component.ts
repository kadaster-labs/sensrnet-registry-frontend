import { Component, forwardRef, OnDestroy, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { Category, TypeSensor, TypeBeacon, TypeCamera } from '../../model/bodies/sensorTypes';
import { Subscription } from 'rxjs';

export interface SensorTypeFormValues {
  typeName: string;
  typeDetails: string;
}

@Component({
  selector: 'app-sensor-type',
  templateUrl: './sensor-type.component.html',
  styleUrls: ['./sensor-type.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SensorTypeComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SensorTypeComponent),
      multi: true,
    },
  ],
})
export class SensorTypeComponent implements ControlValueAccessor, OnDestroy {
  public form: FormGroup;
  public subscriptions: Subscription[] = [];

  @Input()
  public submitted: boolean;

  public sensorTypes = TypeSensor;
  public sensorTypesList: string[];

  public beaconTypes = TypeBeacon;
  public beaconTypesList: string[];

  public cameraTypes = TypeCamera;
  public cameraTypesList: string[];

  public typeDetailsList: string[];
  public sensorCategory: string;


  get value(): SensorTypeFormValues {
    return this.form.value;
  }

  set value(value: SensorTypeFormValues) {
    if (!value) { return; }
    this.form.setValue(value);
    this.onChange(value);
    this.onTouched();
  }

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      typeName: new FormControl('', Validators.required),
      typeDetails: new FormControl('', Validators.required),
    });

    this.subscriptions.push(
      // any time the inner form changes update the parent of any change
      this.form.valueChanges.subscribe((value) => {
        this.onChange(value);
        this.onTouched();
      }),
    );

    this.beaconTypesList = Object.keys(this.beaconTypes).filter(String);
    this.cameraTypesList = Object.keys(this.cameraTypes).filter(String);
    this.sensorTypesList = Object.keys(this.sensorTypes).filter(String);
    this.typeDetailsList = [...this.beaconTypesList, ...this.cameraTypesList, ...this.sensorTypesList]

    this.onFormChanges();
  }

  get f() {
    return this.form.controls;
  }

  // public ngOnChange(changes: SimpleChanges) {
  //   if (changes.submitted) {
  //     this.formSubmitted = changes.submitted;
  //   }
  // }

  private onFormChanges() {
    if (!this.form.get('typeDetails')) { return; }

    this.form.get('typeDetails').valueChanges.subscribe(value => {
      this.form.patchValue({
        typeName: '',
      });

      console.log(value)

      if (this.beaconTypesList.includes(value)) {
        console.log("Beacon")
        this.form.controls['typeName'].setValue("Beacon");

      }
      else if (this.sensorTypesList.includes(value)) {
        console.log("Sensor")
        this.form.controls['typeName'].setValue("Sensor");
      }
      else if (this.cameraTypesList.includes(value)) {
        console.log("Camera")
        this.form.controls['typeName'].setValue("Camera");
      }
    });
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public onChange: any = () => {};
  public onTouched: any = () => {};

  public registerOnChange(fn) {
    this.onChange = fn;
  }

  public writeValue(value) {
    if (value) {
      this.value = value;
    }

    if (value === null) {
      this.form.reset();
    }
  }

  public registerOnTouched(fn) {
    this.onTouched = fn;
  }

  // communicate the inner form validation to the parent form
  public validate(_: FormControl) {
    return this.form.valid ? null : { type: { valid: false } };
  }

}
