import { Observable } from 'rxjs';
import { ViewChildren } from '@angular/core';
import { urlRegex } from '../../helpers/form.helpers';
import { ModalService } from '../../services/modal.service';
import { AlertService } from '../../services/alert.service';
import { Component, forwardRef, Input } from '@angular/core';
import { DeviceService } from '../../services/device.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ObservationGoalService } from '../../services/observation-goal.service';
import { FormBuilder, FormGroup, FormArray, ControlValueAccessor, Validators, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-datastream',
  templateUrl: './datastream.component.html',
  styleUrls: ['./datastream.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatastreamComponent),
      multi: true,
    },
  ]
})
export class DatastreamComponent implements ControlValueAccessor {
  @Input() public deviceId: string;
  @Input() public submitted: boolean;
  @Input() public parentForm: FormGroup;

  @ViewChildren('observationGoals') observationGoalsElements;

  public confirmTitleString = $localize`:@@datastream.delete.confirm.title:Please confirm`;
  public confirmBodyString = $localize`:@@datastream.delete.confirm.body:Do you really want to delete the datastream?`;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly modalService: ModalService,
    private readonly alertService: AlertService,
    private readonly deviceService: DeviceService,
    private readonly observationGoalService: ObservationGoalService,
  ) { }

  createDatastream(): FormGroup {
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
      documentation: [null, [Validators.pattern(urlRegex)]],
      dataLink: [null, [Validators.pattern(urlRegex)]],
      observationGoals: [[]],
    });
  }

  addDatastream(sensorIndex): void {
    const sensors = this.parentForm.get(`sensors`) as FormArray;
    const datastreams = sensors.at(sensorIndex).get(`datastreams`) as FormArray;
    datastreams.push(this.createDatastream());
  }

  removeDatastream(sensorIndex, datastreamIndex): void {
    const sensors = this.parentForm.get(`sensors`) as FormArray;
    const sensorId = this.parentForm.get(`sensors.${sensorIndex}`).value.id;

    const datastreams = sensors.at(sensorIndex).get(`datastreams`) as FormArray;
    const datastreamId = this.parentForm.get(`sensors.${sensorIndex}.datastreams.${datastreamIndex}`).value.id;

    this.modalService.confirm(this.confirmTitleString, this.confirmBodyString).then(() => {
      if (sensorId && datastreamId) {
        try {
          this.deviceService.removeDatastream(this.deviceId, sensorId, datastreamId).toPromise();
        } catch (e) {
          this.alertService.error(e.error.message);
        }
      }
      datastreams.removeAt(datastreamIndex);
    }, () => { });
  }

  public getDatastreamElement(sensorIndex, datastreamIndex, element) {
    return this.parentForm.get(`sensors.${sensorIndex}.datastreams.${datastreamIndex}.${element}`);
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

  formatObservationGoal(observationGoal: any) {
    return observationGoal.name;
  }

  addObservationGoal(sensorIndex, datastreamIndex, $e) {
    $e.preventDefault();

    const newGoal = $e.item;
    const goals = this.parentForm.get(`sensors.${sensorIndex}.datastreams.${datastreamIndex}.observationGoals`).value;
    if (!goals.some(x => x._id === newGoal._id)) {
      goals.push($e.item);
    }

    this.observationGoalsElements.toArray().map(x => x.nativeElement.value = '');
  }

  removeObservationGoal(sensorIndex, datastreamIndex, item) {
    const observationGoals = this.parentForm.get(`sensors.${sensorIndex}.datastreams.${datastreamIndex}.observationGoals`).value;

    let observationGoalIndex = null;
    for (let i = 0; i < observationGoals.length; i++) {
      if (observationGoals[i]._id === item._id) {
        observationGoalIndex = i;
      }
    }

    if (observationGoalIndex !== null) {
      observationGoals.splice(observationGoalIndex, 1);
    }
  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(x => this.observationGoalService.getObservationGoals({
        pageIndex: 0, pageSize: 15, name: x,
      }))
    )
}
