import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { IRegisterSensorBody, SensorService } from '../../services/sensor.service';
import { LocationService } from '../../services/location.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sensor-register',
  templateUrl: './sensor-register.component.html',
  styleUrls: ['./sensor-register.component.scss'],
})
export class SensorRegisterComponent implements OnInit, OnChanges {

  @Input()
  public active = false;

  constructor(
    private router: Router,
    private readonly locationService: LocationService,
    private readonly sensorService: SensorService,
    private readonly formBuilder: FormBuilder,
  ) {
  }

  get f() {
    return this.form.controls;
  }

  public form: FormGroup;

  public submitted = false;

  setName(item: string) {
    this.form.controls.name.setValue(item);
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (!changes.active.previousValue && changes.active.currentValue) {
      this.form.reset();
      this.submitted = false;
    }
  }

  public async close() {
    await this.router.navigate(['']);
  }

  public async submit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    console.log(`posting ${this.form.value}`);
    // TODO: perform extra validation
    const sensor: IRegisterSensorBody = {
      typeName: this.form.value.type.typeName,
      location: this.form.value.location || {},
      dataStreams: this.form.value.dataStreams || [],

      active: JSON.parse(this.form.value.active.value.toLowerCase()) || false, // cast strings (i.e. "true") to boolean
      aim: this.form.value.aim,
      description: this.form.value.description,
      documentationUrl: this.form.value.documentationUrl,
      manufacturer: this.form.value.manufacturer,
      name: this.form.value.name,
      theme: this.form.value.theme.value || [],
      typeDetails: { subType: this.form.value.type.typeDetails || '' },
    };

    try {
      const result = await this.sensorService.register(sensor);

      console.log(`Sensor was successfully posted, received id ${result}`);
      this.locationService.showLocation(null);
    } catch (error) {
      console.log(error);
    }
  }

  public ngOnInit() {
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
}
