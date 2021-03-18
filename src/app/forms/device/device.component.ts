import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { IDevice } from '../../model/bodies/device-model';
import { AlertService } from '../../services/alert.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { LocationService } from '../../services/location.service';
import { getCategoryTranslation } from '../../model/bodies/sensorTypes';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import {
  DeviceService,
  IRegisterDataStreamBody,
  IRegisterDeviceBody,
  IRegisterSensorBody, IUpdateDataStreamBody, IUpdateDeviceBody, IUpdateSensorBody,
} from '../../services/device.service';
import {ModalService} from '../../services/modal.service';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss'],
})
export class DeviceComponent implements OnInit, OnDestroy {
  public deviceId: string;

  public submitted = false;
  public activeStepIndex = 0;

  public subscriptions: Subscription[] = [];

  public deviceForm: FormGroup;
  public sensorForm: FormGroup;

  public formControlSteps: Array<Array<any>>;

  public formInvalidMessage = $localize`:@@form.register.invalid:The form is invalid`;
  public saveSuccessMessage = $localize`:@@register.success:Saved!`;
  public saveFailedMessage = $localize`:@@register.failure:An error has occurred during save:`;

  public saveTitleString = $localize`:@@step.confirm.title:Save the step!`;
  public saveBodyString = $localize`:@@step.confirm.body:You need to save before continuing`;

  constructor(
    private readonly router: Router,
    private modalService: ModalService,
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

  public async goToStep(step: number): Promise<void> {
    if (this.formControlSteps[this.activeStepIndex].some((f) => f.invalid)) {
      this.submitted = true;
    } else {
      this.submitted = false;

      if (step !== this.activeStepIndex) {
        if (this.activeStepIndex === 0) {
          if (this.deviceId) {
            this.activeStepIndex = step;
          } else {
            this.modalService.confirm(this.saveTitleString, this.saveBodyString).then();
          }
        } else if (this.activeStepIndex === 1) {
          const sensors = this.sensorForm.get('sensors') as FormArray;
          const allRegistered = sensors.controls.every(x => x.value.id);

          if (allRegistered) {
            this.activeStepIndex = step;
          } else {
            this.modalService.confirm(this.saveTitleString, this.saveBodyString).then();
          }
        } else if (this.activeStepIndex === 2) {
          let allRegistered = true;

          const sensors = this.sensorForm.get('sensors') as FormArray;
          for (const sensorEntry of sensors.controls) {
            const dataStreams = sensorEntry.get('dataStreams') as FormArray;
            for (const dataStreamForm of dataStreams.controls) {
              if (!dataStreamForm.value.id) {
                allRegistered = false;
              }
            }
          }

          if (allRegistered) {
            this.activeStepIndex = step;
          } else {
            this.modalService.confirm(this.saveTitleString, this.saveBodyString).then();
          }
        }
      }
    }
  }

  public async submitDevice() {
    this.submitted = true;

    if (!this.deviceForm.valid) {
      this.alertService.error(this.formInvalidMessage, false, 4000);
      return;
    }

    await this.saveDevice();
  }

  public async submitSensors() {
    this.submitted = true;

    if (!this.sensorForm.valid) {
      this.alertService.error(this.formInvalidMessage, false, 4000);
      return;
    }

    await this.registerSensors();
  }

  public async submitDataStreams() {
    this.submitted = true;

    if (!this.sensorForm.valid) {
      this.alertService.error(this.formInvalidMessage, false, 4000);
      return;
    }

    await this.registerDataStreams();
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
      id: device._id,
      category: { category: device.category || '' },
      name: device.name || '',
      connectivity: device.connectivity || '',
      description: device.description || '',
      location: { longitude, latitude, height },
      locationName: device.locationDetails && device.locationDetails.name ? device.locationDetails.name : '',
      locationDescription: device.locationDetails && device.locationDetails.description ? device.locationDetails.description : '',
    });
    this.deviceForm.markAsPristine();

    const sensors = this.sensorForm.get('sensors') as FormArray;
    sensors.clear();

    for (const sensor of device.sensors) {
      const dataStreams = new FormArray([]);
      if (device.dataStreams) {
        for (const dataStream of device.dataStreams) {
          if (dataStream.sensorId === sensor._id) {
            dataStreams.push(this.formBuilder.group({
              id: dataStream._id,
              name: [dataStream.name, Validators.required],
              description: dataStream.description,
              theme: dataStream.theme ? {value: dataStream.theme} : null,
              dataQuality: dataStream.dataQuality,
              isActive: !!dataStream.isActive,
              isPublic: !!dataStream.isPublic,
              isOpenData: !!dataStream.isOpenData,
              containsPersonalInfoData: !!dataStream.containsPersonalInfoData,
              isReusable: !!dataStream.isReusable,
              documentation: dataStream.documentation,
              dataLink: dataStream.dataLink,
            }));
          }
        }
      }

      sensors.push(this.formBuilder.group({
        id: sensor._id,
        name: [sensor.name, Validators.required],
        description: [sensor.description, Validators.required],
        typeName: [sensor.type, Validators.required],
        manufacturer: sensor.manufacturer,
        supplier: sensor.supplier,
        documentation: sensor.documentation,
        dataStreams,
      }));

      this.sensorForm.markAsPristine();
    }
  }

  public async saveDevice() {
    if (this.deviceForm.value.id) {
      const deviceUpdate: Record<string, any> = {};
      if (this.deviceForm.controls.name.dirty) {
        deviceUpdate.name = this.deviceForm.value.name;
      }
      if (this.deviceForm.controls.description.dirty) {
        deviceUpdate.description = this.deviceForm.value.description;
      }
      if (this.deviceForm.controls.category.dirty) {
        deviceUpdate.category = this.deviceForm.value.category.category;
      }
      if (this.deviceForm.controls.connectivity.dirty) {
        deviceUpdate.connectivity = this.deviceForm.value.connectivity;
      }
      const location: Record<string, any> = {};
      if (this.deviceForm.controls.locationName.dirty) {
        location.name = this.deviceForm.value.locationName;
      }
      if (this.deviceForm.controls.locationDescription.dirty) {
        location.description = this.deviceForm.value.locationDescription;
      }
      if (this.deviceForm.controls.location.dirty) {
        const deviceLocation = this.deviceForm.value.location;
        location.location = [deviceLocation.longitude, deviceLocation.latitude, deviceLocation.height];
      }
      if (Object.keys(location).length) {
        deviceUpdate.location = location;
      }

      if (Object.keys(deviceUpdate).length) {
        await this.deviceService.update(this.deviceForm.value.id, deviceUpdate as IUpdateDeviceBody).toPromise();
        this.deviceForm.markAsPristine();
      }

      this.submitted = false;
      this.alertService.success(this.saveSuccessMessage, false, 4000);
    } else {
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

        this.deviceForm.markAsPristine();

        this.locationService.showLocation(null);
        this.alertService.success(this.saveSuccessMessage, false, 4000);
        this.submitted = false;
      } catch (e) {
        this.alertService.error(`${this.saveFailedMessage}: ${e.error}.`);
      }
    }
  }

  public async registerSensors() {
    const sensors = this.sensorForm.get('sensors') as FormArray;

    let failed = false;
    for (const sensorEntry of sensors.controls) {
      const sensorEntryValue = sensorEntry.value;
      if (!sensorEntryValue.id) {
        const sensor: IRegisterSensorBody = {
          name: sensorEntryValue.name,
          description: sensorEntryValue.description,
          type: sensorEntryValue.typeName,
          manufacturer: sensorEntryValue.manufacturer,
          supplier: sensorEntryValue.supplier,
          documentation: sensorEntryValue.documentation,
        };

        try {
          const sensorResult: Record<string, any> = await this.deviceService.registerSensor(this.deviceId, sensor).toPromise();
          sensorEntry.patchValue({id: sensorResult.sensorId});
        } catch (e) {
          failed = true;
          this.alertService.error(e.message, false, 4000);
        }
      } else {
        const sensorUpdate: Record<string, any> = {};
        if (sensorEntry.get('name').dirty) {
          sensorUpdate.name = sensorEntryValue.name;
        }
        if (sensorEntry.get('description').dirty) {
          sensorUpdate.description = sensorEntryValue.description;
        }
        if (sensorEntry.get('typeName').dirty) {
          sensorUpdate.type = sensorEntryValue.typeName;
        }
        if (sensorEntry.get('manufacturer').dirty) {
          sensorUpdate.manufacturer = sensorEntryValue.manufacturer;
        }
        if (sensorEntry.get('supplier').dirty) {
          sensorUpdate.supplier = sensorEntryValue.supplier;
        }
        if (sensorEntry.get('documentation').dirty) {
          sensorUpdate.documentation = sensorEntryValue.documentation;
        }

        if (Object.keys(sensorUpdate).length) {
          await this.deviceService.updateSensor(this.deviceId, sensorEntryValue.id, sensorUpdate as IUpdateSensorBody).toPromise();
          this.sensorForm.markAsPristine();
        }

        this.submitted = false;
        this.alertService.success(this.saveSuccessMessage, false, 4000);
      }
    }

    if (!failed) {
      this.alertService.success(this.saveSuccessMessage, false, 4000);
    }

    this.submitted = false;
  }

  public async registerDataStreams() {
    const sensors = this.sensorForm.get('sensors') as FormArray;

    let failed = false;
    for (const sensorEntry of sensors.controls) {
      const sensorId = sensorEntry.value.id;

      const dataStreams = sensorEntry.get('dataStreams') as FormArray;
      for (const dataStreamEntry of dataStreams.controls) {
        const dataStreamFormValue = dataStreamEntry.value;
        const dataStream: IRegisterDataStreamBody = {
          name: dataStreamFormValue.name,
          description: dataStreamFormValue.description,
          theme: dataStreamFormValue.theme ? dataStreamFormValue.theme.value : null,
          dataQuality: dataStreamFormValue.dataQuality,
          isActive: dataStreamFormValue.isActive,
          isPublic: dataStreamFormValue.isPublic,
          isOpenData: dataStreamFormValue.isOpenData,
          containsPersonalInfoData: dataStreamFormValue.containsPersonalInfoData,
          isReusable: dataStreamFormValue.isReusable,
          documentation: dataStreamFormValue.documentation,
          dataLink: dataStreamFormValue.dataLink,
        };

        try {
          const dataStreamId = dataStreamEntry.value.id;
          if (sensorId && !dataStreamId) {
            try {
              const dataStreamResult: Record<string, any> = await this.deviceService.registerDataStream(this.deviceId,
                sensorId, dataStream).toPromise();
              dataStreamEntry.patchValue({id: dataStreamResult.dataStreamId});
            } catch (e) {
              failed = true;
              this.alertService.error(e.message, false, 4000);
            }
          } else {
            const dataStreamUpdate: Record<string, any> = {};
            if (dataStreamEntry.get('name').dirty) {
              dataStreamUpdate.name = dataStreamFormValue.name;
            }
            if (dataStreamEntry.get('description').dirty) {
              dataStreamUpdate.description = dataStreamFormValue.description;
            }
            if (dataStreamEntry.get('theme').dirty) {
              dataStreamUpdate.theme = dataStreamFormValue.theme ? dataStreamFormValue.theme.value : null;
            }
            if (dataStreamEntry.get('dataQuality').dirty) {
              dataStreamUpdate.dataQuality = dataStreamFormValue.dataQuality;
            }
            if (dataStreamEntry.get('isActive').dirty) {
              dataStreamUpdate.isActive = dataStreamFormValue.isActive;
            }
            if (dataStreamEntry.get('isPublic').dirty) {
              dataStreamUpdate.isPublic = dataStreamFormValue.isPublic;
            }
            if (dataStreamEntry.get('isOpenData').dirty) {
              dataStreamUpdate.isOpenData = dataStreamFormValue.isOpenData;
            }
            if (dataStreamEntry.get('containsPersonalInfoData').dirty) {
              dataStreamUpdate.containsPersonalInfoData = dataStreamFormValue.containsPersonalInfoData;
            }
            if (dataStreamEntry.get('isReusable').dirty) {
              dataStreamUpdate.isReusable = dataStreamFormValue.isReusable;
            }
            if (dataStreamEntry.get('documentation').dirty) {
              dataStreamUpdate.documentation = dataStreamFormValue.documentation;
            }
            if (dataStreamEntry.get('dataLink').dirty) {
              dataStreamUpdate.dataLink = dataStreamFormValue.dataLink;
            }

            if (Object.keys(dataStreamUpdate).length) {
              await this.deviceService.updateDataStream(this.deviceId, sensorId, dataStreamId,
                dataStreamUpdate as IUpdateDataStreamBody).toPromise();
              this.sensorForm.markAsPristine();
            }

            this.submitted = false;
            this.alertService.success(this.saveSuccessMessage, false, 4000);
          }
        } catch (e) {
          this.alertService.error(e.message, false, 4000);
        }
      }
    }

    if (!failed) {
      this.alertService.success(this.saveSuccessMessage, false, 4000);
    }

    this.submitted = false;
  }

  public ngOnInit() {
    this.deviceForm = this.formBuilder.group({
      id: null,
      category: '',
      name: ['', [Validators.required, Validators.minLength(6)]],
      connectivity: '',
      description: '',
      location: [],
      locationName: '',
      locationDescription: '',
      sensors: new FormArray([]),
    });

    this.sensorForm = this.formBuilder.group({
      sensors: new FormArray([]),
    });

    this.formControlSteps = [
      [
        this.deviceForm.controls.category,
        this.deviceForm.controls.name,
        this.deviceForm.controls.connectivity,
        this.deviceForm.controls.description,
        this.deviceForm.controls.location,
        this.deviceForm.controls.locationName,
        this.deviceForm.controls.locationDescription,
      ], [
        this.sensorForm.controls.sensors,
      ], [
        this.sensorForm.controls.sensors,
      ]
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
