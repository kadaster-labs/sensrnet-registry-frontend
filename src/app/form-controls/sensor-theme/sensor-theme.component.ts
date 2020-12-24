import { Subscription } from 'rxjs';
import { SensorTheme, SensorThemeTranslation } from '../../model/bodies/sensorTheme';
import { Component, forwardRef, OnDestroy, Input, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS,
  NG_VALUE_ACCESSOR } from '@angular/forms';

// describes what the return value of the form control will look like
export interface SensorThemeFormValues {
  value: SensorTheme[];
}

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
export class SensorThemeComponent implements ControlValueAccessor, OnDestroy, AfterViewInit {
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

  public sensorThemes = SensorTheme;
  public sensorThemesList: string[];
  public sensorThemeTranslation = SensorThemeTranslation;

  constructor(
    private formBuilder: FormBuilder,
  ) {
    this.form = this.formBuilder.group({
      value: new FormControl([]),
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

  public get f() {
    return this.form.controls;
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public onChange: any = () => {};
  public onTouched: any = () => {};

  public registerOnChange(fn: any) {
    this.onChange = fn;
  }

  public writeValue(value: SensorThemeFormValues) {
    if (value) {
      this.value = value;
    }

    if (value === null) {
      this.form.reset();
      this.form.markAsPristine();
    }
    ($('.selectpicker') as any).selectpicker('refresh');
  }

  public registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  // communicate the inner form validation to the parent form
  public validate(_: FormControl) {
    return this.form.valid ? null : { theme: { valid: false } };
  }

  ngAfterViewInit(): void {
    ($('.selectpicker') as any).selectpicker('refresh');
  }
}
