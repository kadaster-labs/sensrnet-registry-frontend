import { Subscription } from 'rxjs';
import { Category, getCategoryTranslation } from '../../model/bodies/sensorTypes';
import { Component, forwardRef, OnDestroy, Input, EventEmitter, Output } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor, FormBuilder, FormControl, Validators,
  FormGroup } from '@angular/forms';

export interface SensorTypeFormValues {
  category: string;
  typeName: string;
}

@Component({
  selector: 'app-device-type',
  templateUrl: './device-type.component.html',
  styleUrls: ['./device-type.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DeviceTypeComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DeviceTypeComponent),
      multi: true,
    },
  ],
})
export class DeviceTypeComponent implements ControlValueAccessor, OnDestroy {
  public form: FormGroup;
  public subscriptions: Subscription[] = [];

  @Input() public submitted: boolean;
  @Output() sensorType = new EventEmitter<string>();

  public sensorCategories = Category;
  public getCategoryTranslation = getCategoryTranslation;

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
      category: new FormControl('', Validators.required),
    });

    this.subscriptions.push(
      this.form.valueChanges.subscribe((value) => {
        this.onChange(value);
        this.onTouched();
      }),
    );

    this.onFormChanges();
  }

  get f() {
    return this.form.controls;
  }

  private onFormChanges() {
    if (!this.form.get('category')) { return; }

    this.form.get('category').valueChanges.subscribe((category: Category) => {
      if (category) {
        this.sensorType.emit(category);
      }
    });
  }

  public ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  public onChange: any = () => { };
  public onTouched: any = () => { };

  public registerOnChange(fn: any) {
    this.onChange = fn;
  }

  public writeValue(value: SensorTypeFormValues) {
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
    return this.form.valid ? null : { type: { valid: false } };
  }
}
