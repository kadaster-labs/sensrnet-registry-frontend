import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { IRegisterSensorBody, SensorService } from '../services/sensor.service';

@Component({
  selector: 'app-sensor-register',
  templateUrl: './sensor-register.component.html',
  styleUrls: ['./sensor-register.component.css'],
})
export class SensorRegisterComponent implements OnInit {

  constructor(
    private readonly sensorService: SensorService,
    private readonly formBuilder: FormBuilder,
  ) {
  }

  get form() {
    return this.RegisterSensor.controls;
  }

  public RegisterSensor: FormGroup;

  public registerSensorSubmitted = false;
  public registerSensorSent = false;

  public ngOnInit() {
    this.RegisterSensor = this.formBuilder.group({
      name: new FormControl('', [Validators.required, Validators.minLength(6)]),
      aim: new FormControl(''),
      description: new FormControl(''),
      manufacturer: new FormControl('', Validators.required),
      active: new FormControl(''),
      documentationUrl: new FormControl('', Validators.required),
      location: [],
      type: [],
      theme: [],
    });
  }

  public onSensorChange(event) {
    console.log('sensor changed');
    console.log(event);
  }

  public selectLocationOn() {
  }

  public clearLocationLayer() {
  }

  public async submitRegisterSensor() {
    this.registerSensorSubmitted = true;

    // stop here if form is invalid
    if (this.RegisterSensor.invalid) {
      return;
    }

    console.log(`posting ${this.RegisterSensor.value}`);
    // TODO: perform extra validation
    const sensor: IRegisterSensorBody = {
      typeName: this.RegisterSensor.value.typeName,
      location: this.RegisterSensor.value.location || { x: 0, y: 0, z: 0 },
      dataStreams: this.RegisterSensor.value.dataStreams || [],

      active: this.RegisterSensor.value.active || false,
      aim: this.RegisterSensor.value.aim,
      description: this.RegisterSensor.value.description,
      documentationUrl: this.RegisterSensor.value.documentationUrl,
      manufacturer: this.RegisterSensor.value.manufacturer,
      name: this.RegisterSensor.value.name,
      theme: this.RegisterSensor.value.theme.value || [],
    };

    try {
      const result = await this.sensorService.register(sensor);

      console.log(`Sensor was succesfully posted, received id ${result}`);
      this.clearLocationLayer();
      // this.togglePane('SensorRegister');
    } catch (error) {
      console.log(error);
    }
  }
}
