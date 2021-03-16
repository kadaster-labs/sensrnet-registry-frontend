import { Component, forwardRef, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ControlValueAccessor, Validators, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-datastream',
  templateUrl: './datastream.component.html',
  styleUrls: ['./datastream.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DataStreamComponent),
      multi: true,
    },
  ]
})
export class DataStreamComponent implements ControlValueAccessor {
  @Input() public submitted: boolean;
  @Input() public parentForm: FormGroup;

  private urlRegex = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

  constructor(
    private formBuilder: FormBuilder,
    ) {}

  createDataStream(): FormGroup {
    return this.formBuilder.group({
      name: ['', Validators.required],
      description: '',
      observedProperty: '',
      theme: [],
      dataQuality: '',
      isActive: true,
      isPublic: true,
      isOpenData: true,
      containsPersonalInfoData: true,
      isReusable: true,
      documentation: ['', [Validators.pattern(this.urlRegex)]],
      dataLink: ['', [Validators.pattern(this.urlRegex)]],
    });
  }

  addDataStream(): void {
    const dataStreams = this.parentForm.get('dataStreams') as FormArray;
    dataStreams.push(this.createDataStream());
  }

  removeDataStream(index): void {
    const dataStreams = this.parentForm.get('dataStreams') as FormArray;
    dataStreams.removeAt(index);
  }

  get f() {
    return this.parentForm.get('dataStreams') as FormArray;
  }

  public getDataStreamElement(i, elem) {
    return this.parentForm.get(`dataStreams.${i}.${elem}`);
  }

  get value() {
    return this.parentForm.controls.dataStreams.value;
  }

  set value(value) {
    if (!value) { return; }
    this.parentForm.controls.dataStreams.setValue(value);
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
