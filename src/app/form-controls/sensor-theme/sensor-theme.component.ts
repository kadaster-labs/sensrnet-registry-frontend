import { Component, forwardRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { SensorTheme } from '../../model/bodies/sensorTheme';

// describes what the return value of the form control will look like
export interface SensorThemeFormValues {
  value: SensorTheme[];
}

/**
 * This component doesn't work as desired yet. When changing the model externally, the change is not reflected in the
 * template. The component we use is ng-multiselect-dropdown, which uses the onPush ChangeDetection strategy. For now,
 * disable theme changing. See if it can be circumvented, otherwise, ditch/fork component
 *
 * https://github.com/angular/angular/issues/10816
 */
@Component({
  selector: 'app-sensor-theme',
  templateUrl: './sensor-theme.component.html',
  styleUrls: ['./sensor-theme.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SensorThemeComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SensorThemeComponent),
      multi: true,
    },
  ],
})
export class SensorThemeComponent implements ControlValueAccessor, OnDestroy {
  public form: FormGroup;
  public subscriptions: Subscription[] = [];

  get value(): SensorThemeFormValues {
    return this.form.value;
  }

  set value(value: SensorThemeFormValues) {
    if (!value) { return; }
    this.form.setValue(value);
    this.onChange(value);
    this.onTouched();

    this.cdf.detectChanges();
  }

  public sensorThemes = SensorTheme;
  public sensorThemesList: string[];
  public dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    itemsShowLimit: 2,
    allowSearchFilter: false,
    enableCheckAll: false,
  };

  constructor(
    private formBuilder: FormBuilder,
    private cdf: ChangeDetectorRef,
  ) {
    this.form = this.formBuilder.group({
      value: new FormControl([], Validators.required),
    });

    this.sensorThemesList = Object.keys(this.sensorThemes).filter(String);

    this.subscriptions.push(
      // any time the inner form changes update the parent of any change
      this.form.valueChanges.subscribe((value) => {
        this.onChange(value);
        this.onTouched();
      }),
    );
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
    return this.form.valid ? null : { theme: { valid: false } };
  }
}
