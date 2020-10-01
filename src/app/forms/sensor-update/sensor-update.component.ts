import { Component, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ISensor } from '../../model/bodies/sensor-body';
import { IUpdateSensorBody, SensorService } from '../../services/sensor.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-sensor-update',
  templateUrl: './sensor-update.component.html',
  styleUrls: ['./sensor-update.component.scss'],
})
export class SensorUpdateComponent {

  public form: FormGroup;
  public sensorUpdateSent = false;

  public sensor: ISensor;
  public active: boolean;
  @Output() public closePane = new EventEmitter<void>();

  constructor(
    private router: Router,
    private readonly formBuilder: FormBuilder,
    private readonly sensorService: SensorService,
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

  public onSensorSelected(sensor) {
    this.sensor = sensor;

    this.form.setValue({
      name: this.sensor.name || '',
      aim: this.sensor.aim || '',
      description: this.sensor.description || '',
      manufacturer: this.sensor.manufacturer || '',
      active: { value: this.sensor.active.toString() || false },
      documentationUrl: this.sensor.documentationUrl || '',
      location: {
        latitude: this.sensor.location ? this.sensor.location.coordinates[1] : null,
        longitude: this.sensor.location ? this.sensor.location.coordinates[0] : null,
        height: this.sensor.location ? this.sensor.location.coordinates[2] : null,
        baseObjectId: this.sensor.baseObjectId || 'non-empty',
      },
      type: {
        typeName: this.sensor.typeName ? this.sensor.typeName[0] : '',
        typeDetails: this.sensor.typeDetails ? this.sensor.typeDetails.subType : '',
      },
      theme: { value: this.sensor.theme || [] },
    });
  }

  get f() {
    return this.form.controls;
  }

  public async submit() {
    if (!this.form.valid) {
      return;
    }

    const newValues = this.form.value;
    const sensor = {
      typeName: newValues.type.typeName,
      location: newValues.location,
      dataStreams: newValues.dataStreams,

      typeDetails: { subType: newValues.type.typeDetails },
      active: newValues.active || false,
      aim: newValues.aim,
      description: newValues.description !== '' ? newValues.description : undefined,
      documentationUrl: newValues.documentationUrl !== '' ? newValues.documentationUrl : undefined,
      manufacturer: newValues.manufacturer,
      name: newValues.name,
      theme: newValues.theme.value,
    };

    try {
      const active: boolean = JSON.parse(sensor.active.value); // "true" -> true, case insensitive
      if (active === true && !this.sensor.active) {
        await this.sensorService.activate(this.sensor._id);
      } else if (active === false && this.sensor.active) {
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
        typeDetails: sensor.typeDetails,
        theme: sensor.theme,
      };
      const result = await this.sensorService.updateDetails(this.sensor._id, details);
      console.log(`Sensor was successfully updated, received id ${result}`);
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

  public async close() {
    await this.router.navigate(['']);
  }
}
