import { Subscription } from 'rxjs';
import { ISensor } from '../../model/bodies/sensor-body';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { IDataStream } from '../../model/bodies/datastream-body';
import { LocationService } from '../../services/location.service';
import { getTypeTranslation } from '../../model/bodies/sensorTypes';
import { ConnectionService } from '../../services/connection.service';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import {
  IRegisterSensorBody,
  IUpdateLocationBody,
  IUpdateSensorBody,
  SensorService
} from '../../services/sensor.service';

@Component({
  selector: 'app-sensor',
  templateUrl: './sensor.component.html',
  styleUrls: ['./sensor.component.scss'],
})
export class SensorComponent implements OnInit, OnDestroy {
  public sensor: ISensor;
  public canSubmitSensor = true;

  public submitted = false;
  public activeStepIndex = 0;

  public subscriptions: Subscription[] = [];

  public form: FormGroup;
  public formControlSteps: Array<Array<any>>;

  public urlRegex = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

  public sensorRegisterSuccessMessage = $localize`:@@sensor.register.success:Sensor registered`;
  public sensorRegisterInvalidMessage = $localize`:@@sensor.register.invalid:The form is invalid`;
  public sensorRegisterFailedMessage = $localize`:@@sensor.register.failure:An error has occurred during registration:`;
  public sensorRegisteredOrganizationMessage = $localize`:@@sensor.register.org:You need to join an organization first`;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly alertService: AlertService,
    private readonly sensorService: SensorService,
    private readonly locationService: LocationService,
    private readonly connectionService: ConnectionService,
  ) {}

  get f() {
    return this.form.controls;
  }

  public setNameFromCategory(item: string) {
    this.form.controls.name.setValue(getTypeTranslation(item));
  }

  public goToStep(step: number): void {
    if (this.formControlSteps[this.activeStepIndex].some((f) => f.invalid)) {
      this.submitted = true;
    } else {
      this.submitted = false;
      this.activeStepIndex = step;
    }
  }

  public getStepCount(): number {
    return this.formControlSteps.length;
  }

  public getStepClasses(pageIndex: number) {
    return { active: this.activeStepIndex === pageIndex, finished: this.activeStepIndex > pageIndex };
  }

  public setSensor(sensor: ISensor): void {
    this.sensor = sensor;

    this.locationService.highlightLocation({
      type: 'Point',
      coordinates: this.sensor.location.coordinates
    });

    const claim = this.connectionService.currentClaim;
    if (claim && claim.organizationId && sensor.organizations) {
      this.canSubmitSensor = sensor.organizations.some(e => e.id === claim.organizationId);
    } else {
      this.canSubmitSensor = false;
    }

    this.form.patchValue({
      aim: this.sensor.aim || '',
      description: this.sensor.description || '',
      manufacturer: this.sensor.manufacturer || '',
      active: { value: this.sensor.active.toString() || false },
      documentationUrl: this.sensor.documentationUrl || '',
      location: {
        longitude: this.sensor.location ? this.sensor.location.coordinates[0] : null,
        latitude: this.sensor.location ? this.sensor.location.coordinates[1] : null,
        height: this.sensor.location ? this.sensor.location.coordinates[2] : null
      },
      type: {
        category: this.sensor.category || '',
        typeName: this.sensor.typeName || '',
      },
      theme: { value: this.sensor.theme || [] },
    });

    // Overwrite the name generated by type.
    this.form.patchValue({
      name: this.sensor.name || '',
    });

    const dataStreams = this.form.get('dataStreams') as FormArray;
    dataStreams.clear();
    for (const dataStream of this.sensor.dataStreams) {
      dataStreams.push(this.formBuilder.group({
        dataStreamId: dataStream.dataStreamId,
        name: [dataStream.name, Validators.required],
        reason: dataStream.reason || '',
        description: dataStream.description || '',
        observedProperty: dataStream.observedProperty || '',
        isPublic: !!dataStream.isPublic,
        isOpenData: !!dataStream.isOpenData,
        isReusable: !!dataStream.isReusable,
        documentationUrl: [dataStream.documentationUrl || '', [Validators.pattern(this.urlRegex)]],
        dataLink: [dataStream.dataLink || '', [Validators.pattern(this.urlRegex)]],
        unitOfMeasurement: dataStream.unitOfMeasurement || '',
        dataFrequency: dataStream.dataFrequency || 0,
        dataQuality: dataStream.dataQuality || 0,
      }));
    }
  }

  public async updateSensor() {
    const updatedSensorProperties = {
      location: this.form.value.location,
      dataStreams: this.form.value.dataStreams,
      active: this.form.value.active || false,
      aim: this.form.value.aim,
      description: this.form.value.description,
      documentationUrl: this.form.value.documentationUrl,
      manufacturer: this.form.value.manufacturer,
      name: this.form.value.name,
      theme: this.form.value.theme.value,
      category: this.form.value.type.category,
      typeName: this.form.value.type.typeName,
    };

    try {
      const active: boolean = JSON.parse(updatedSensorProperties.active.value);
      if (active === true && !this.sensor.active) {
        await this.sensorService.activate(this.sensor._id);
      } else if (active === false && this.sensor.active) {
        await this.sensorService.deactivate(this.sensor._id);
      }
    } catch (error) {
      console.error(error);
    }

    try {
      const currentDataStreams = this.sensor.dataStreams || [];
      const newDataStreams = updatedSensorProperties.dataStreams || [];
      const newDataStreamIds = newDataStreams.map((d) => d.dataStreamId);
      for (let newDataStream of newDataStreams) {
        if (newDataStream.dataStreamId) {  // The data-stream existed already: maybe it is updated.
          for (const currentDataStream of currentDataStreams) {
            if (newDataStream.dataStreamId === currentDataStream.dataStreamId) {
              const updatedProperties: IDataStream = {};
              for (const property of ['name', 'isPublic', 'isOpenData', 'isReusable', 'dataFrequency', 'dataQuality']) {
                if (newDataStream[property] !== currentDataStream[property]) {
                  updatedProperties[property] = newDataStream[property];
                }
              }
              for (const property of ['reason', 'description', 'observedProperty', 'documentationUrl', 'dataLink',
                'unitOfMeasurement']) {
                if (newDataStream[property] !== currentDataStream[property]) {
                  if (newDataStream[property] || currentDataStream[property]) {
                    updatedProperties[property] = newDataStream[property];
                  }
                }
              }
              if (Object.keys(updatedProperties).length) {
                await this.sensorService.updateDatastream(this.sensor._id, newDataStream.dataStreamId, updatedProperties);
              }
            }
          }
        } else if (!newDataStream.dataStreamId) {  // The data-stream has been newly created;
          newDataStream = {
            name: newDataStream.name,
            reason: newDataStream.reason || undefined,
            description: newDataStream.description || undefined,
            observedProperty: newDataStream.observedProperty || undefined,
            isPublic: newDataStream.isPublic,
            isOpenData: newDataStream.isOpenData,
            isReusable: newDataStream.isReusable,
            documentationUrl: newDataStream.documentationUrl || undefined,
            dataLink: newDataStream.dataLink || undefined,
            unitOfMeasurement: newDataStream.unitOfMeasurement || undefined,
            dataFrequency: newDataStream.dataFrequency,
            dataQuality: newDataStream.dataQuality,
          };
          await this.sensorService.addDatastream(this.sensor._id, newDataStream);
        }
      }

      for (const currentDataStream of currentDataStreams) {
        if (currentDataStream.dataStreamId && !newDataStreamIds.includes(currentDataStream.dataStreamId)) {
          await this.sensorService.deleteDatastream(this.sensor._id, currentDataStream.dataStreamId);
        }
      }
    } catch (error) {
      console.error(error);
    }

    try {
      const updatedProperties: IUpdateSensorBody = {};
      for (const property of ['name', 'category', 'typeName']) {
        if (this.sensor[property] !== updatedSensorProperties[property]) {
          updatedProperties[property] = updatedSensorProperties[property];
        }
      }
      if (updatedSensorProperties.theme.length) {  // A theme is selected
        if (this.sensor.theme && this.sensor.theme.length) { // And a theme existed already
          const a = new Set(this.sensor.theme);
          const b = new Set(updatedSensorProperties.theme);
          if (!(a.size === b.size && [...a].every(value => b.has(value)))) {  // The theme has changed
            updatedProperties.theme = updatedSensorProperties.theme;
          }
        } else { // No theme has previously been selected
          updatedProperties.theme = updatedSensorProperties.theme;
        }
      } else if (this.sensor.theme && this.sensor.theme.length) { // No theme has currently been selected.
        updatedProperties.theme = [];
      }
      for (const property of ['aim', 'description', 'documentationUrl', 'manufacturer']) {
        if (this.sensor[property] !== updatedSensorProperties[property]) {
          if (this.sensor[property] || updatedSensorProperties[property]) {
            updatedProperties[property] = updatedSensorProperties[property];
          }
        }
      }

      if (Object.keys(updatedProperties).length) {
        await this.sensorService.updateDetails(this.sensor._id, updatedProperties);
        console.log(`Sensor ${this.sensor._id} was successfully updated.`);
      }
    } catch (error) {
      console.error(error);
    }

    const heightUpdated = this.sensor.location.coordinates[2] !== updatedSensorProperties.location.height;
    const latitudeUpdated = this.sensor.location.coordinates[1] !== updatedSensorProperties.location.latitude;
    const longitudeUpdated = this.sensor.location.coordinates[0] !== updatedSensorProperties.location.longitude;
    if (longitudeUpdated || latitudeUpdated || heightUpdated) {
      const updateLocationBody: IUpdateLocationBody = {
        location: [
          updatedSensorProperties.location.longitude,
          updatedSensorProperties.location.latitude,
          updatedSensorProperties.location.height
        ],
      };

      try {
        await this.sensorService.updateLocation(this.sensor._id, updateLocationBody);
      } catch (error) {
        console.error(error);
      }
    }

    await this.router.navigate(['']);
  }

  public async registerSensor() {
    const dataStreams = [];
    const formDataStreams = this.form.value.dataStreams || [];
    for (const dataStream of formDataStreams) {
      dataStreams.push({
        name: dataStream.name,
        reason: dataStream.reason || undefined,
        description: dataStream.description || undefined,
        observedProperty: dataStream.observedProperty || undefined,
        isPublic: dataStream.isPublic,
        isOpenData: dataStream.isOpenData,
        isReusable: dataStream.isReusable,
        documentationUrl: dataStream.documentationUrl || undefined,
        dataLink: dataStream.dataLink || undefined,
        unitOfMeasurement: dataStream.unitOfMeasurement || undefined,
        dataFrequency: dataStream.dataFrequency,
        dataQuality: dataStream.dataQuality,
      });
    }

    const sensorLocation = this.form.value.location;
    const sensor: IRegisterSensorBody = {
      dataStreams,
      location: sensorLocation ? [sensorLocation.longitude, sensorLocation.latitude, sensorLocation.height] : [],
      active: JSON.parse(this.form.value.active.value.toLowerCase()) || false, // cast strings ("true") to boolean
      aim: this.form.value.aim,
      description: this.form.value.description,
      documentationUrl: this.form.value.documentationUrl || undefined,
      manufacturer: this.form.value.manufacturer || undefined,
      name: this.form.value.name,
      theme: this.form.value.theme ? this.form.value.theme.value : [],
      category: this.form.value.type.category,
      typeName: this.form.value.type.typeName,
    };

    try {
      await this.sensorService.register(sensor);

      this.locationService.showLocation(null);
      this.alertService.success(this.sensorRegisterSuccessMessage, false, 4000);
    } catch (error) {
      this.alertService.error(`${this.sensorRegisterFailedMessage}: ${error}.`);
    }
  }

  public async submit() {
    this.submitted = true;

    if (!this.form.valid) {
      this.alertService.error(this.sensorRegisterInvalidMessage, false, 4000);
      return;
    }

    const claim = this.connectionService.currentClaim;
    if (!claim || !claim.organizationId) {
      this.alertService.error(this.sensorRegisteredOrganizationMessage);
      return;
    }

    if (this.sensor) {
      await this.updateSensor();
    } else {
      await this.registerSensor();
    }
  }

  public ngOnInit() {
    const urlRegex = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

    this.form = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(6)]],
      aim: '',
      description: '',
      manufacturer: '',
      active: '',
      documentationUrl: ['', [Validators.pattern(urlRegex)]],
      dataStreams: new FormArray([]),
      location: [],
      type: [],
      theme: [],
    });

    this.formControlSteps = [
      [
        this.form.controls.name,
        this.form.controls.type,
        this.form.controls.active,
      ], [
        this.form.controls.aim,
        this.form.controls.description,
        this.form.controls.manufacturer,
        this.form.controls.documentationUrl,
        this.form.controls.theme,
      ], [
        this.form.controls.dataStreams,
      ], [
        this.form.controls.location,
      ]
    ];

    this.subscriptions.push(
      this.route.params.subscribe(async params => {
        if (params.id) {
          const sensor = await this.sensorService.get(params.id);
          this.setSensor(sensor as ISensor);

          this.locationService.showLocation(null);
        }
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
