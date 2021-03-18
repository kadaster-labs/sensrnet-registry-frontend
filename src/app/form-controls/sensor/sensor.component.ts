import { TypeSensor } from '../../model/bodies/sensorTypes';
import { Component, forwardRef, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ControlValueAccessor, Validators, NG_VALUE_ACCESSOR } from '@angular/forms';
import {ModalService} from '../../services/modal.service';
import {DeviceService} from '../../services/device.service';
import {AlertService} from '../../services/alert.service';

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
  @Input() public deviceId: string;
  @Input() public submitted: boolean;
  @Input() public parentForm: FormGroup;

  public typeNameList: string[] = Object.keys(TypeSensor);

  private urlRegex = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

  public confirmTitleString = $localize`:@@sensor.delete.confirm.title:Please confirm`;
  public confirmBodyString = $localize`:@@sensor.delete.confirm.body:Do you really want to delete the sensor?`;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: ModalService,
    private readonly alertService: AlertService,
    private readonly deviceService: DeviceService,
    ) {}

  createSensor(): FormGroup {
    return this.formBuilder.group({
      id: null,
      name: [null, Validators.required],
      description: [null, Validators.required],
      typeName: [null, Validators.required],
      manufacturer: null,
      supplier: null,
      documentation: [null, [Validators.pattern(this.urlRegex)]],
      dataStreams: new FormArray([]),
    });
  }

  addSensor(): void {
    const sensors = this.parentForm.get('sensors') as FormArray;
    sensors.push(this.createSensor());
  }

  removeSensor(index): void {
    const sensors = this.parentForm.get('sensors') as FormArray;
    const sensorId = this.parentForm.get(`sensors.${index}`).value.id;

    this.modalService.confirm(this.confirmTitleString, this.confirmBodyString)
      .then(async confirmed => {
        if (confirmed) {
          if (sensorId) {
            try {
              await this.deviceService.removeSensor(this.deviceId, sensorId).toPromise();
              sensors.removeAt(index);
            } catch (e) {
              this.alertService.error(`Failed to delete: ${e.error}.`);
            }
          } else {
            sensors.removeAt(index);
          }
        }
      }).catch(() => console.log('User dismissed the dialog.'));
  }

  public getSensorElement(i, elem) {
    return this.parentForm.get(`sensors.${i}.${elem}`);
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
