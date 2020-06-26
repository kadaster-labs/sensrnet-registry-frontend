import { Component, forwardRef, OnDestroy, Input } from '@angular/core';
import { LocationService } from '../../services/location.service';
import { ISensorLocation } from '../../model/bodies/location';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

export interface SensorLocationFormValues {
  latitude: number;
  longitude: number;
  height: number;
  baseObjectId: 'non-empty';
}

@Component({
  selector: 'app-sensor-location',
  templateUrl: './sensor-location.component.html',
  styleUrls: ['./sensor-location.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SensorLocationComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SensorLocationComponent),
      multi: true,
    },
  ],
})
export class SensorLocationComponent implements ControlValueAccessor, OnDestroy {
  public form: FormGroup;
  public subscriptions: Subscription[] = [];

  public selectLocation = false;

  private location: ISensorLocation;

  @Input()
  public submitted: boolean;

  get value(): SensorLocationFormValues {
    return this.form.value;
  }

  set value(value: SensorLocationFormValues) {
    if (!value) { return; }
    this.form.setValue(value);
    this.onChange(value);
    this.onTouched();
  }

  constructor(
    private readonly locationService: LocationService,
    private readonly formBuilder: FormBuilder,
  ) {
    this.form = this.formBuilder.group({
      height: [null, Validators.required],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],
      baseObjectId: [null, Validators.required],
    });

    this.subscriptions.push(
      // any time the inner form changes update the parent of any change
      this.form.valueChanges.subscribe((value) => {
        this.onChange(value);
        this.onTouched();
      }),
    );

    this.locationService.location$.subscribe(location => {
      if (this.selectLocation === true) {
        this.location = location;
        console.log(`location set to ${JSON.stringify(this.location)}`);
        this.form.setValue({
            height: location.coordinates[2],
            latitude: location.coordinates[0],
            longitude: location.coordinates[1],
            baseObjectId: 'non-empty',
        });

        this.locationService.showLocation(location);

        this.selectLocation = false;
      }
    });
  }

  public locationValidator(g: FormGroup) {
    return g.get('latitude').value && g.get('longitude') && g.get('height') && g.get('baseObjectId') ? null :
      {required: true};
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public onChange: any = () => {};
  public onTouched: any = () => {};

  public registerOnChange(fn) {
    this.onChange = fn;
  }

  public registerOnTouched(fn) {
    this.onTouched = fn;
  }

  public writeValue(value) {
    if (value) {
      this.value = value;
    }

    if (value === null) {
      this.form.reset();
    }
  }

  // communicate the inner form validation to the parent form
  public validate(_: FormControl) {
    return this.form.valid ? null : { location: { valid: false } };
  }
}
