import { Component, forwardRef, Input, OnDestroy } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, FormGroup, FormBuilder, FormControl, Validators, ControlValueAccessor } from '@angular/forms';
import { Subscription } from 'rxjs';

export interface SensorThemeFormValues {
  value: boolean;
}

@Component({
  selector: 'app-sensor-status',
  templateUrl: './sensor-status.component.html',
  styleUrls: ['./sensor-status.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SensorStatusComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SensorStatusComponent),
      multi: true,
    },
  ],
})
export class SensorStatusComponent implements ControlValueAccessor, OnDestroy {
  public form: FormGroup;
  public subscriptions: Subscription[] = [];

  @Input() public submitted: boolean;

  get value(): SensorThemeFormValues {
    return this.form.value;
  }

  set value(value: SensorThemeFormValues) {
    if (!value) { return; }
    this.form.setValue(value);
    this.onChange(value);
    this.onTouched();
  }

  constructor(
    private formBuilder: FormBuilder,
  ) {
    this.form = this.formBuilder.group({
      value: new FormControl(null, Validators.required),
    });

    this.subscriptions.push(
      // any time the inner form changes update the parent of any change
      this.form.valueChanges.subscribe((value) => {
        this.onChange(value);
        this.onTouched();
      }),
    );
  }

  public get f() {
    return this.form.controls;
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public onChange: any = () => { };
  public onTouched: any = () => { };

  public registerOnChange(fn: any) {
    this.onChange = fn;
  }

  public writeValue(value: SensorThemeFormValues) {
    if (value) {
      this.value = value;
    }

    if (value === null) {
      this.form.reset();
    }
  }

  public registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  // communicate the inner form validation to the parent form
  public validate(_: FormControl) {
    return this.form.valid ? null : { theme: { valid: false } };
  }
}

