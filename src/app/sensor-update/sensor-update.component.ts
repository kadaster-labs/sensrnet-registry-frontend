import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ISensor } from '../model/bodies/sensor-body';
import { IUpdateSensorBody, SensorService } from '../services/sensor.service';

@Component({
  selector: 'app-sensor-update',
  templateUrl: './sensor-update.component.html',
  styleUrls: ['./sensor-update.component.scss'],
})
export class SensorUpdateComponent implements OnChanges {

  public form: FormGroup;

  public sensorUpdateSent = false;

  @Input() public sensor: ISensor;
  @Input() public active: boolean;
  @Output() public closePane = new EventEmitter<void>();

  constructor(
    private readonly sensorService: SensorService,
    private readonly formBuilder: FormBuilder,
  ) {
    const reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

    this.form = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(6)]],
      aim: '',
      description: '',
      manufacturer: ['', Validators.required],
      active: '',
      documentationUrl: ['', [Validators.required, Validators.pattern(reg)]],
      location: [],
      type: [],
      theme: [],
    });
  }

  public ngOnChanges(changes: SimpleChanges) {
    const selectedSensor = changes.sensor.currentValue ? changes.sensor.currentValue : {};
    this.form.setValue({
      name: selectedSensor.name || '',
      aim: selectedSensor.aim || '',
      description: selectedSensor.description || '',
      manufacturer: selectedSensor.manufacturer || '',
      active: selectedSensor.active || false,
      documentationUrl: selectedSensor.documentationUrl || '',
      location: {
        latitude: selectedSensor.location ? selectedSensor.location.coordinates[1] : null,
        longitude: selectedSensor.location ? selectedSensor.location.coordinates[0] : null,
        height: selectedSensor.location ? selectedSensor.location.coordinates[2] : null,
        baseObjectId: selectedSensor.baseObjectId || 'non-empty',
      },
      type: {
        typeName: selectedSensor.typeName ? selectedSensor.typeName[0] : '',
        typeDetails: selectedSensor.typeDetails ? selectedSensor.typeDetails[0].subType : '',
      },
      theme: { value: selectedSensor.theme || [] },
    });

    // if (changes.active.previousValue && !changes.active.currentValue) {
    //   // clear form if pane get closed
    //   this.form.reset();
    //   this.locationService.showLocation(null);
    // }
  }

  get f() {
    return this.form.controls;
  }

  public close() {
    console.log('close');
    this.closePane.emit();
  }

  public async submit() {
    const newValues =  this.form.value;
    const sensor = {
      typeName: newValues.type.typeName,
      location: newValues.location,
      dataStreams: newValues.dataStreams,

      active: newValues.active || false,
      aim: newValues.aim,
      description: newValues.description !== '' ? newValues.description : undefined,
      documentationUrl: newValues.documentationUrl !== '' ? newValues.documentationUrl : undefined,
      manufacturer: newValues.manufacturer,
      name: newValues.name,
      theme: newValues.theme.value,
    };

    try {
      if (sensor.active === true && !this.sensor.active) {
        await this.sensorService.activate(this.sensor._id);
      } else if (sensor.active === false && this.sensor.active) {
        await this.sensorService.deactivate(this.sensor._id);
      }
    } catch (error) {
      console.error(error);
    }

    // TODO: only if some details have changed
    try {
      const details: IUpdateSensorBody = {
        aim: sensor.aim,
        description: sensor.description,
        documentationUrl: sensor.documentationUrl,
        manufacturer: sensor.manufacturer,
        name: sensor.name,
        typeName: sensor.typeName,
        theme: sensor.theme,
      };
      const result = await this.sensorService.updateDetails(this.sensor._id, details);
      console.log(`Sensor was succesfully updated, received id ${result}`);
    } catch (error) {
      console.error(error);
    }

    // TODO: only if location was changed
    if (sensor.location) {
      try {
        await this.sensorService.updateLocation(this.sensor._id, sensor.location);
      } catch (error) {
        console.error(error);
      }
    }
  }
}
