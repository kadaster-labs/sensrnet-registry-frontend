import { Subscription } from 'rxjs';
import { ISensor } from '../../model/bodies/sensor-body';
import { ActivatedRoute, Router } from '@angular/router';
import { IDevice } from '../../model/bodies/device-model';
import { AlertService } from '../../services/alert.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { LocationService } from '../../services/location.service';
import { getCategoryTranslation } from '../../model/bodies/sensorTypes';
import { ConnectionService } from '../../services/connection.service';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import {DeviceService, IRegisterDeviceBody, IRegisterSensorBody} from '../../services/device.service';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss'],
})
export class DeviceComponent implements OnInit, OnDestroy {
  public deviceId: string;
  public sensorIds: string[];

  public submitted = false;
  public activeStepIndex = 0;

  public subscriptions: Subscription[] = [];

  public deviceForm: FormGroup;
  public deviceFormControlSteps: Array<any>;

  public sensorForm: FormGroup;
  public sensorFormControlSteps: Array<any>;

  public urlRegex = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

  public formInvalidMessage = $localize`:@@form.register.invalid:The form is invalid`;
  public deviceRegisterSuccessMessage = $localize`:@@device.register.success:Device registered`;
  public deviceRegisterFailedMessage = $localize`:@@device.register.failure:An error has occurred during registration:`;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly alertService: AlertService,
    private readonly deviceService: DeviceService,
    private readonly locationService: LocationService,
  ) {}

  get deviceControls() {
    return this.deviceForm.controls;
  }

  public setNameFromCategory(item: string) {
    this.deviceForm.controls.name.setValue(getCategoryTranslation(item));
  }

  public goToStep(step: number): void {
    if (step === 0) {
      if (this.deviceFormControlSteps[this.activeStepIndex].some(f => f.invalid)) {
        this.submitted = true;
      } else {
        this.submitted = false;
        this.activeStepIndex = step;
      }
    } else {
      this.activeStepIndex = step;
    }
  }

  public async submitDevice() {
    this.submitted = true;

    if (!this.deviceForm.valid) {
      this.alertService.error(this.formInvalidMessage, false, 4000);
      return;
    }

    await this.registerDevice();
  }

  public async submitSensors() {
    this.submitted = true;

    if (!this.sensorForm.valid) {
      this.alertService.error(this.formInvalidMessage, false, 4000);
      return;
    }

    await this.registerSensors();
  }

  public getStepCount(): number {
    return 3;
  }

  public getStepClasses(pageIndex: number) {
    return { active: this.activeStepIndex === pageIndex, finished: this.activeStepIndex > pageIndex };
  }

  public setDevice(device: IDevice): void {
    this.locationService.highlightLocation({
      type: 'Point',
      coordinates: device.location.coordinates
    });

    const location = device.location;
    const longitude = location.coordinates.length > 0 ? location.coordinates[0] : null;
    const latitude = location.coordinates.length > 1 ? location.coordinates[1] : null;
    const height = location.coordinates.length > 2 ? location.coordinates[2] : null;

    this.deviceForm.patchValue({
      category: { category: device.category || '' },
      name: device.name || '',
      connectivity: device.connectivity || '',
      description: device.description || '',
      location: { longitude, latitude, height },
      locationName: device.locationDetails && device.locationDetails.name ? device.locationDetails.name : '',
      locationDescription: device.locationDetails && device.locationDetails.description ? device.locationDetails.description : '',
    });

    const sensors = this.sensorForm.get('sensors') as FormArray;
    sensors.clear();

    for (const sensor of device.sensors) {
      sensors.push(this.formBuilder.group({
        name: [sensor.name, Validators.required],
        description: [sensor.description, Validators.required],
        typeName: [sensor.type, Validators.required],
        manufacturer: sensor.manufacturer,
        supplier: sensor.supplier,
        documentation: sensor.documentation,
        dataStreams: new FormArray([]),
      }));
    }

    // this.form.patchValue({
    //   aim: this.sensor.aim || '',
    //   description: this.sensor.description || '',
    //   manufacturer: this.sensor.manufacturer || '',
    //   active: { value: this.sensor.active.toString() || false },
    //   documentationUrl: this.sensor.documentationUrl || '',
    //   location: {
    //     longitude: this.sensor.location ? this.sensor.location.coordinates[0] : null,
    //     latitude: this.sensor.location ? this.sensor.location.coordinates[1] : null,
    //     height: this.sensor.location ? this.sensor.location.coordinates[2] : null
    //   },
    //   type: {
    //     category: this.sensor.category || '',
    //     typeName: this.sensor.typeName || '',
    //   },
    //   theme: { value: this.sensor.theme || [] },
    // });
    //
    // // Overwrite the name generated by type.
    // this.form.patchValue({
    //   name: this.sensor.name || '',
    // });
    //
    // const dataStreams = this.form.get('dataStreams') as FormArray;
    // dataStreams.clear();
    // for (const dataStream of this.sensor.dataStreams) {
    //   dataStreams.push(this.formBuilder.group({
    //     dataStreamId: dataStream.dataStreamId,
    //     name: [dataStream.name, Validators.required],
    //     reason: dataStream.reason || '',
    //     description: dataStream.description || '',
    //     observedProperty: dataStream.observedProperty || '',
    //     isPublic: !!dataStream.isPublic,
    //     isOpenData: !!dataStream.isOpenData,
    //     isReusable: !!dataStream.isReusable,
    //     documentationUrl: [dataStream.documentationUrl || '', [Validators.pattern(this.urlRegex)]],
    //     dataLink: [dataStream.dataLink || '', [Validators.pattern(this.urlRegex)]],
    //     unitOfMeasurement: dataStream.unitOfMeasurement || '',
    //     dataFrequency: dataStream.dataFrequency || 0,
    //     dataQuality: dataStream.dataQuality || 0,
    //   }));
    // }
  }

  // public async updateSensor() {
  //   const updatedSensorProperties = {
  //     location: this.form.value.location,
  //     dataStreams: this.form.value.dataStreams,
  //     active: this.form.value.active || false,
  //     aim: this.form.value.aim,
  //     description: this.form.value.description,
  //     documentationUrl: this.form.value.documentationUrl,
  //     manufacturer: this.form.value.manufacturer,
  //     name: this.form.value.name,
  //     theme: this.form.value.theme.value,
  //     category: this.form.value.type.category,
  //     typeName: this.form.value.type.typeName,
  //   };
  //
  //   try {
  //     const active: boolean = JSON.parse(updatedSensorProperties.active.value);
  //     if (active === true && !this.sensor.active) {
  //       await this.deviceService.activate(this.sensor._id);
  //     } else if (active === false && this.sensor.active) {
  //       await this.deviceService.deactivate(this.sensor._id);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  //
  //   try {
  //     const currentDataStreams = this.sensor.dataStreams || [];
  //     const newDataStreams = updatedSensorProperties.dataStreams || [];
  //     const newDataStreamIds = newDataStreams.map((d) => d.dataStreamId);
  //     for (let newDataStream of newDataStreams) {
  //       if (newDataStream.dataStreamId) {  // The data-stream existed already: maybe it is updated.
  //         for (const currentDataStream of currentDataStreams) {
  //           if (newDataStream.dataStreamId === currentDataStream.dataStreamId) {
  //             const updatedProperties: IDataStream = {};
  //             for (const property of ['name', 'isPublic', 'isOpenData', 'isReusable', 'dataFrequency', 'dataQuality']) {
  //               if (newDataStream[property] !== currentDataStream[property]) {
  //                 updatedProperties[property] = newDataStream[property];
  //               }
  //             }
  //             for (const property of ['reason', 'description', 'observedProperty', 'documentationUrl', 'dataLink',
  //               'unitOfMeasurement']) {
  //               if (newDataStream[property] !== currentDataStream[property]) {
  //                 if (newDataStream[property] || currentDataStream[property]) {
  //                   updatedProperties[property] = newDataStream[property];
  //                 }
  //               }
  //             }
  //             if (Object.keys(updatedProperties).length) {
  //               await this.deviceService.updateDatastream(this.sensor._id, newDataStream.dataStreamId, updatedProperties);
  //             }
  //           }
  //         }
  //       } else if (!newDataStream.dataStreamId) {  // The data-stream has been newly created;
  //         newDataStream = {
  //           name: newDataStream.name,
  //           reason: newDataStream.reason || undefined,
  //           description: newDataStream.description || undefined,
  //           observedProperty: newDataStream.observedProperty || undefined,
  //           isPublic: newDataStream.isPublic,
  //           isOpenData: newDataStream.isOpenData,
  //           isReusable: newDataStream.isReusable,
  //           documentationUrl: newDataStream.documentationUrl || undefined,
  //           dataLink: newDataStream.dataLink || undefined,
  //           unitOfMeasurement: newDataStream.unitOfMeasurement || undefined,
  //           dataFrequency: newDataStream.dataFrequency,
  //           dataQuality: newDataStream.dataQuality,
  //         };
  //         await this.deviceService.addDatastream(this.sensor._id, newDataStream);
  //       }
  //     }
  //
  //     for (const currentDataStream of currentDataStreams) {
  //       if (currentDataStream.dataStreamId && !newDataStreamIds.includes(currentDataStream.dataStreamId)) {
  //         await this.deviceService.deleteDatastream(this.sensor._id, currentDataStream.dataStreamId);
  //       }
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  //
  //   try {
  //     const updatedProperties: IUpdateSensorBody = {};
  //     for (const property of ['name', 'category', 'typeName']) {
  //       if (this.sensor[property] !== updatedSensorProperties[property]) {
  //         updatedProperties[property] = updatedSensorProperties[property];
  //       }
  //     }
  //     if (updatedSensorProperties.theme.length) {  // A theme is selected
  //       if (this.sensor.theme && this.sensor.theme.length) { // And a theme existed already
  //         const a = new Set(this.sensor.theme);
  //         const b = new Set(updatedSensorProperties.theme);
  //         if (!(a.size === b.size && [...a].every(value => b.has(value)))) {  // The theme has changed
  //           updatedProperties.theme = updatedSensorProperties.theme;
  //         }
  //       } else { // No theme has previously been selected
  //         updatedProperties.theme = updatedSensorProperties.theme;
  //       }
  //     } else if (this.sensor.theme && this.sensor.theme.length) { // No theme has currently been selected.
  //       updatedProperties.theme = [];
  //     }
  //     for (const property of ['aim', 'description', 'documentationUrl', 'manufacturer']) {
  //       if (this.sensor[property] !== updatedSensorProperties[property]) {
  //         if (this.sensor[property] || updatedSensorProperties[property]) {
  //           updatedProperties[property] = updatedSensorProperties[property];
  //         }
  //       }
  //     }
  //
  //     if (Object.keys(updatedProperties).length) {
  //       await this.deviceService.updateDetails(this.sensor._id, updatedProperties);
  //       console.log(`Sensor ${this.sensor._id} was successfully updated.`);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  //
  //   const heightUpdated = this.sensor.location.coordinates[2] !== updatedSensorProperties.location.height;
  //   const latitudeUpdated = this.sensor.location.coordinates[1] !== updatedSensorProperties.location.latitude;
  //   const longitudeUpdated = this.sensor.location.coordinates[0] !== updatedSensorProperties.location.longitude;
  //   if (longitudeUpdated || latitudeUpdated || heightUpdated) {
  //     const updateLocationBody: IUpdateLocationBody = {
  //       location: [
  //         updatedSensorProperties.location.longitude,
  //         updatedSensorProperties.location.latitude,
  //         updatedSensorProperties.location.height
  //       ],
  //     };
  //
  //     try {
  //       await this.deviceService.updateLocation(this.sensor._id, updateLocationBody);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   }
  //
  //   await this.router.navigate(['']);
  // }

  public async registerDevice() {
    const deviceLocation = this.deviceForm.value.location;

    const device: IRegisterDeviceBody = {
      name: this.deviceForm.value.name,
      description: this.deviceForm.value.description,
      category: this.deviceForm.value.category.category,
      connectivity: this.deviceForm.value.connectivity,
      location: {
        name: this.deviceForm.value.locationName,
        description: this.deviceForm.value.locationDescription,
        location: deviceLocation ? [deviceLocation.longitude, deviceLocation.latitude, deviceLocation.height] : null,
      },
    };

    try {
      const deviceDetails: Record<string, any> = await this.deviceService.register(device).toPromise();
      this.deviceId = deviceDetails.deviceId;

      this.locationService.showLocation(null);
      this.alertService.success(this.deviceRegisterSuccessMessage, false, 4000);
      this.submitted = false;
    } catch (e) {
      this.alertService.error(`${this.deviceRegisterFailedMessage}: ${e.error}.`);
    }

    // const dataStreams = [];
    // const formDataStreams = this.form.value.dataStreams || [];
    // for (const dataStream of formDataStreams) {
    //   dataStreams.push({
    //     name: dataStream.name,
    //     reason: dataStream.reason || undefined,
    //     description: dataStream.description || undefined,
    //     observedProperty: dataStream.observedProperty || undefined,
    //     isPublic: dataStream.isPublic,
    //     isOpenData: dataStream.isOpenData,
    //     isReusable: dataStream.isReusable,
    //     documentationUrl: dataStream.documentationUrl || undefined,
    //     dataLink: dataStream.dataLink || undefined,
    //     unitOfMeasurement: dataStream.unitOfMeasurement || undefined,
    //     dataFrequency: dataStream.dataFrequency,
    //     dataQuality: dataStream.dataQuality,
    //   });
    // }
    //
    // const sensorLocation = this.form.value.location;
    // const sensor: IRegisterSensorBody = {
    //   dataStreams,
    //   location: sensorLocation ? [sensorLocation.longitude, sensorLocation.latitude, sensorLocation.height] : null,
    //   active: JSON.parse(this.form.value.active.value.toLowerCase()) || false, // cast strings ("true") to boolean
    //   aim: this.form.value.aim,
    //   description: this.form.value.description,
    //   documentationUrl: this.form.value.documentationUrl || null,
    //   manufacturer: this.form.value.manufacturer || null,
    //   name: this.form.value.name,
    //   theme: this.form.value.theme ? this.form.value.theme.value : [],
    //   category: this.form.value.type.category,
    //   typeName: this.form.value.type.typeName,
    // };
    //
    // try {
    //   await this.deviceService.register(sensor);
    //
    //   this.locationService.showLocation(null);
    //   this.alertService.success(this.deviceRegisterSuccessMessage, false, 4000);
    // } catch (error) {
    //   this.alertService.error(`${this.deviceRegisterFailedMessage}: ${error}.`);
    // }
  }

  public async registerSensors() {
    for (const sensorForm of this.sensorForm.value.sensors) {
      const sensor: IRegisterSensorBody = {
        name: sensorForm.name,
        description: sensorForm.description,
        type: sensorForm.typeName,
        manufacturer: sensorForm.manufacturer,
        supplier: sensorForm.supplier,
        documentation: sensorForm.documentation,
      };

      try {
        await this.deviceService.registerSensor(this.deviceId, sensor).toPromise();
      } catch (e) {
        console.log(e);
      }
    }
    this.submitted = false;
  }

  public ngOnInit() {
    this.deviceForm = this.formBuilder.group({
      category: '',
      name: ['', [Validators.required, Validators.minLength(6)]],
      connectivity: '',
      description: '',
      location: [],
      locationName: '',
      locationDescription: '',
    });

    this.deviceFormControlSteps = [
      this.deviceControls.category,
      this.deviceControls.name,
      this.deviceControls.connectivity,
      this.deviceControls.description,
      this.deviceControls.location,
      this.deviceControls.locationName,
      this.deviceControls.locationDescription,
    ];

    this.sensorForm = this.formBuilder.group({
      sensors: new FormArray([]),
    });

    this.sensorFormControlSteps = [
      this.deviceControls.sensors,
    ];

    this.subscriptions.push(
      this.route.params.subscribe(async params => {
        if (params.id) {
          const device = await this.deviceService.get(params.id).toPromise();
          if (device) {
            this.deviceId = params.id;
            this.setDevice(device as IDevice);
          }

          this.locationService.showLocation(null);
        }
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
