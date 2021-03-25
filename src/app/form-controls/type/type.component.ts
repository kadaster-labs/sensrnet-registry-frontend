import { Subscription } from 'rxjs';
import { SensorTypes } from '../../model/bodies/sensorTypes';
import {Component, forwardRef, OnDestroy, Input, AfterViewInit, OnInit} from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS,
  NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-sensor-type',
  templateUrl: './type.component.html',
  styleUrls: ['./type.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TypeComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TypeComponent),
      multi: true,
    },
  ],
})
export class TypeComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {
  public form: FormGroup;
  public subscriptions: Subscription[] = [];

  @Input() public submitted: boolean;

  get value() {
    return this.form.value;
  }

  set value(value) {
    if (!value) { return; }
    this.form.setValue(value);
    this.onChange(value);
    this.onTouched();
  }

  public sensorTypes = SensorTypes;

  constructor(
    private formBuilder: FormBuilder,
  ) {
    this.form = this.formBuilder.group({
      value: new FormControl([]),
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

  public onChange: any = () => {};
  public onTouched: any = () => {};

  public registerOnChange(fn: any) {
    this.onChange = fn;
  }

  public writeValue(value) {
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

  ngOnInit(): void {
    ($('.selectpicker') as any).selectpicker('refresh');
  }
}
