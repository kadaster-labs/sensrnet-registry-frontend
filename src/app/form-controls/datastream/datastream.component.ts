import { Component, forwardRef, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ControlValueAccessor, Validators, NG_VALUE_ACCESSOR } from '@angular/forms';
import {ModalService} from '../../services/modal.service';
import {AlertService} from '../../services/alert.service';
import {DeviceService} from '../../services/device.service';

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
  @Input() public deviceId: string;
  @Input() public submitted: boolean;
  @Input() public parentForm: FormGroup;

  private urlRegex = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*([/#!?=\\w]+)?';

  public confirmTitleString = $localize`:@@dataStream.delete.confirm.title:Please confirm`;
  public confirmBodyString = $localize`:@@dataStream.delete.confirm.body:Do you really want to delete the datastream?`;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: ModalService,
    private readonly alertService: AlertService,
    private readonly deviceService: DeviceService,
    ) {}

  createDataStream(): FormGroup {
    return this.formBuilder.group({
      id: null,
      name: [null, Validators.required],
      description: null,
      observedProperty: null,
      theme: [],
      dataQuality: null,
      isActive: true,
      isPublic: true,
      isOpenData: true,
      containsPersonalInfoData: false,
      isReusable: true,
      documentation: [null, [Validators.pattern(this.urlRegex)]],
      dataLink: [null, [Validators.pattern(this.urlRegex)]],
    });
  }

  addDataStream(sensorIndex): void {
    const sensors = this.parentForm.get(`sensors`) as FormArray;
    const dataStreams = sensors.at(sensorIndex).get(`dataStreams`) as FormArray;
    dataStreams.push(this.createDataStream());
  }

  removeDataStream(sensorIndex, dataStreamIndex): void {
    const sensors = this.parentForm.get(`sensors`) as FormArray;
    const sensorId = this.parentForm.get(`sensors.${sensorIndex}`).value.id;

    const dataStreams = sensors.at(sensorIndex).get(`dataStreams`) as FormArray;
    const dataStreamId = this.parentForm.get(`sensors.${sensorIndex}.dataStreams.${dataStreamIndex}`).value.id;

    this.modalService.confirm(this.confirmTitleString, this.confirmBodyString)
      .then(async confirmed => {
        if (confirmed) {
          if (sensorId && dataStreamId) {
            try {
              await this.deviceService.removeDataStream(this.deviceId, sensorId, dataStreamId).toPromise();
              dataStreams.removeAt(dataStreamIndex);
            } catch (e) {
              this.alertService.error(e.error.message);
            }
          } else {
            dataStreams.removeAt(dataStreamIndex);
          }
        }
      }).catch(() => console.log('User dismissed the dialog.'));
  }

  public getDataStreamElement(sensorIndex, dataStreamIndex, element) {
    return this.parentForm.get(`sensors.${sensorIndex}.dataStreams.${dataStreamIndex}.${element}`);
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
