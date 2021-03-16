import { TypeSensor } from '../../model/bodies/sensorTypes';
import { Component, forwardRef, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ControlValueAccessor, Validators, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SensorComponent),
      multi: true,
    },
  ]
})
export class SensorComponent implements ControlValueAccessor {
  @Input() public submitted: boolean;
  @Input() public parentForm: FormGroup;

  public typeNameList: string[] = Object.keys(TypeSensor);

  private urlRegex = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

  constructor(
    private formBuilder: FormBuilder,
    ) {}

  createSensor(): FormGroup {
    return this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      typeName: ['', Validators.required],
      manufacturer: '',
      supplier: '',
      documentation: ['', [Validators.pattern(this.urlRegex)]],
      dataStreams: new FormArray([]),
    });
  }

  addSensor(): void {
    const sensors = this.parentForm.get('sensors') as FormArray;
    sensors.push(this.createSensor());
  }

  removeSensor(index): void {
    const sensors = this.parentForm.get('sensors') as FormArray;
    sensors.removeAt(index);
  }

  get f() {
    return this.parentForm.get('sensors') as FormArray;
  }

  public getSensorElement(i, elem) {
    return this.parentForm.get(`sensors.${i}.${elem}`);
  }

  public getSensorElementForm(i) {
    return this.parentForm.get(`sensors.${i}`) as FormGroup;
  }

  get value() {
    return this.parentForm.controls.sensors.value;
  }

  set value(value) {
    if (!value) { return; }
    this.parentForm.controls.sensors.setValue(value);
    this.onChange(value);
    this.onTouched();
  }

  public onChange: any = () => { };
  public onTouched: any = () => { };

  public registerOnChange(fn: any) {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  public writeValue(value) {
    if (value) {
      this.value = value;
    }
  }
}
