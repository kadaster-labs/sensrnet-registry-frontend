import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ISensor } from '../model/bodies/sensor-body';
import { ILocationBody, IUpdateSensorBody, SensorService } from '../services/sensor.service';

@Component({
  selector: 'app-sensor-update',
  templateUrl: './sensor-update.component.html',
  styleUrls: ['./sensor-update.component.css'],
})
export class SensorUpdateComponent implements OnInit, OnChanges {

  public SensorUpdate = new FormGroup({
    name: new FormControl(),
    aim: new FormControl(),
    description: new FormControl(),
    manufacturer: new FormControl(),
    active: new FormControl(),
    documentationUrl: new FormControl(),
    location: new FormControl([Validators.required]),
    typeName: new FormControl([Validators.required]),
    typeDetailsName: new FormControl(),
    theme: new FormControl(),
  });

  public sensorUpdateSent = false;

  @Input()
  public sensor: ISensor;

  constructor(
    private readonly sensorService: SensorService,
  ) {
  }

  public ngOnChanges(changes: SimpleChanges) {
    const selectedSensor = changes.sensor.currentValue ? changes.sensor.currentValue : {};
    this.SensorUpdate.setValue({
      name: selectedSensor.name || '',
      aim: selectedSensor.aim || '',
      description: selectedSensor.description || '',
      manufacturer: selectedSensor.manufacturer || '',
      active: selectedSensor.active || false,
      documentationUrl: selectedSensor.documentationUrl || '',
      location: selectedSensor.location || {},
      typeName: selectedSensor.typeName || '',
      typeDetailsName: selectedSensor.typeDetailsName || '',
      theme: selectedSensor.theme || '',
    });
  }

  public ngOnInit() {
  }

  public onSensorChange(event) {
    console.log('sensor changed');
    console.log(event);
  }

  public selectLocationOn() {
  }

  public clearLocationLayer() {
  }

  public async submit() {
    const newValues = this.SensorUpdate.value;
    const sensor = {
      typeName: Array.isArray(newValues.typeName) ? newValues.typeName[0] : newValues.typeName,
      location: newValues.location,
      dataStreams: newValues.dataStreams,

      active: newValues.active || false,
      aim: newValues.aim,
      description: newValues.description !== '' ? newValues.description : undefined,
      documentationUrl: newValues.documentationUrl !== '' ? newValues.documentationUrl : undefined,
      manufacturer: newValues.manufacturer,
      name: newValues.name,
      theme: newValues.theme,
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
        const location: ILocationBody = {
          latitude: sensor.location.coordinates[1],
          longitude: sensor.location.coordinates[0],
          height: sensor.location.coordinates[2],
          baseObjectId: sensor.location.baseObjectId,
        };
        await this.sensorService.updateLocation(this.sensor._id, location);
      } catch (error) {
        console.error(error);
      }
    }
  }
}
