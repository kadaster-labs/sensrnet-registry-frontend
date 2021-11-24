import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { urlRegex } from '../../helpers/form.helpers';
import { IDevice } from '../../model/bodies/device-model';
import { getCategoryTranslation } from '../../model/bodies/sensorTypes';
import { AlertService } from '../../services/alert.service';
import {
    DeviceService,
    IRegisterDatastreamBody,
    IRegisterDeviceBody,
    IRegisterSensorBody,
    IUpdateDatastreamBody,
    IUpdateDeviceBody,
    IUpdateSensorBody,
} from '../../services/device.service';
import { LocationService } from '../../services/location.service';
import { ObservationGoalService } from '../../services/observation-goal.service';

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
    public saveSuccessMessage = $localize`:@@device.register.success:Saved!`;
    public saveFailedMessage = $localize`:@@device.register.failure:An error has occurred during saving:`;

    public saveBodyString = $localize`:@@step.confirm.body:You need to save before continuing`;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly formBuilder: FormBuilder,
        private readonly alertService: AlertService,
        private readonly deviceService: DeviceService,
        private readonly locationService: LocationService,
        private readonly observationGoalService: ObservationGoalService,
    ) {}

    get deviceControls() {
        return this.deviceForm.controls;
    }

    public setNameFromCategory(item: string) {
        this.deviceForm.controls.name.setValue(getCategoryTranslation(item));
    }

    public async goToStep(step: number): Promise<void> {
        if (this.formControlSteps[this.activeStepIndex].some((x) => x.invalid)) {
            this.submitted = true;
        } else {
            this.submitted = false;

            if (step !== this.activeStepIndex) {
                if (this.activeStepIndex === 0) {
                    if (this.deviceId) {
                        this.activeStepIndex = step;
                    } else {
                        this.alertService.warning(this.saveBodyString);
                    }
                } else if (this.activeStepIndex === 1) {
                    const sensors = this.sensorForm.get('sensors') as FormArray;
                    const allRegistered = sensors.controls.every((x) => x.value.id);

                    if (allRegistered) {
                        this.activeStepIndex = step;
                    } else {
                        this.alertService.warning(this.saveBodyString);
                    }
                } else if (this.activeStepIndex === 2) {
                    let allRegistered = true;

                    const sensors = this.sensorForm.get('sensors') as FormArray;
                    for (const sensorEntry of sensors.controls) {
                        const datastreams = sensorEntry.get('datastreams') as FormArray;
                        for (const datastreamForm of datastreams.controls) {
                            if (!datastreamForm.value.id) {
                                allRegistered = false;
                            }
                        }
                    }

                    if (allRegistered) {
                        this.activeStepIndex = step;
                    } else {
                        this.alertService.warning(this.saveBodyString);
                    }
                }
            }
        }
    }

    public async submitDevice() {
        this.submitted = true;

        if (!this.deviceForm.valid) {
            this.alertService.error(this.formInvalidMessage);
            return;
        }

        await this.saveDevice();
    }

    public async submitSensors() {
        this.submitted = true;

        if (!this.sensorForm.valid) {
            this.alertService.error(this.formInvalidMessage);
            return;
        }

        await this.saveSensors();
    }

    public async submitDatastreams() {
        this.submitted = true;

        if (!this.sensorForm.valid) {
            this.alertService.error(this.formInvalidMessage);
            return;
        }

        await this.saveDatastreams();
    }

    public getStepCount(): number {
        return this.formControlSteps.length;
    }

    public getStepClasses(pageIndex: number) {
        return { active: this.activeStepIndex === pageIndex, finished: this.activeStepIndex > pageIndex };
    }

    public async setDevice(device: IDevice): Promise<void> {
        this.locationService.highlightLocation({
            type: 'Point',
            coordinates: device.location.coordinates,
        });

        const location = device.location;
        const longitude = location.coordinates.length > 0 ? location.coordinates[0] : null;
        const latitude = location.coordinates.length > 1 ? location.coordinates[1] : null;
        const height = location.coordinates.length > 2 ? location.coordinates[2] : null;

        this.deviceForm.patchValue({
            id: device._id,
            category: { category: device.category || null },
            name: device.name || null,
            connectivity: device.connectivity || null,
            description: device.description || null,
            location: { longitude, latitude, height },
            locationName: device.locationDetails && device.locationDetails.name ? device.locationDetails.name : null,
            locationDescription:
                device.locationDetails && device.locationDetails.description
                    ? device.locationDetails.description
                    : null,
        });
        this.deviceForm.markAsPristine();

        const sensors = this.sensorForm.get('sensors') as FormArray;
        sensors.clear();

        for (const sensor of device.sensors) {
            const datastreams = new FormArray([]);
            if (device.datastreams) {
                for (const datastream of device.datastreams) {
                    if (datastream.sensorId === sensor._id) {
                        const observationGoals = [];
                        if (datastream.observationGoalIds) {
                            for (const observationGoalId of datastream.observationGoalIds) {
                                const observationGoal = await this.observationGoalService
                                    .get(observationGoalId)
                                    .toPromise();
                                if (observationGoal) {
                                    observationGoals.push(observationGoal);
                                }
                            }
                        }

                        datastreams.push(
                            this.formBuilder.group({
                                id: datastream._id,
                                name: [datastream.name, Validators.required],
                                description: datastream.description,
                                theme: datastream.theme ? { value: datastream.theme } : null,
                                dataQuality: datastream.dataQuality,
                                isActive: !!datastream.isActive,
                                isPublic: !!datastream.isPublic,
                                isOpenData: !!datastream.isOpenData,
                                containsPersonalInfoData: !!datastream.containsPersonalInfoData,
                                isReusable: !!datastream.isReusable,
                                documentation: datastream.documentation,
                                dataLink: datastream.dataLink,
                                observationGoals: [observationGoals],
                                observedArea: datastream.observationArea,
                            }),
                        );
                    }
                }
            }

            sensors.push(
                this.formBuilder.group({
                    id: sensor._id,
                    name: [sensor.name, Validators.required],
                    description: [sensor.description, Validators.required],
                    typeName: [sensor.type ? { value: sensor.type } : null, Validators.required],
                    manufacturer: sensor.manufacturer,
                    supplier: sensor.supplier,
                    documentation: [sensor.documentation, [Validators.pattern(urlRegex)]],
                    datastreams,
                }),
            );
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

            try {
                if (Object.keys(deviceUpdate).length) {
                    await this.deviceService
                        .update(this.deviceForm.value.id, deviceUpdate as IUpdateDeviceBody)
                        .toPromise();
                    this.deviceForm.markAsPristine();
                    this.alertService.success(this.saveSuccessMessage);
                }
            } catch (e) {
                this.alertService.error(e.error.message);
            }

            this.submitted = false;
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
                    location: deviceLocation
                        ? [deviceLocation.longitude, deviceLocation.latitude, deviceLocation.height]
                        : null,
                },
            };

            try {
                const deviceDetails: Record<string, any> = await this.deviceService.register(device).toPromise();
                this.deviceId = deviceDetails.deviceId;
                this.deviceForm.markAsPristine();

                this.locationService.showLocation(null);
                this.alertService.success(this.saveSuccessMessage);
                this.submitted = false;
            } catch (e) {
                this.alertService.error(`${this.saveFailedMessage} ${e.error.message}.`);
            }
        }
    }

    public async updateObservationGoals(sensorId, datastreamId, observationGoalIds) {
        const device = (await this.deviceService.get(this.deviceId).toPromise()) as IDevice;
        const deviceDatastreams =
            device && device.datastreams ? device.datastreams.filter((x) => x._id === datastreamId) : [];

        const promises = [];
        if (deviceDatastreams.length) {
            const existingObservationGoalIds = deviceDatastreams[0].observationGoalIds;
            for (const observationGoalId of observationGoalIds) {
                if (!existingObservationGoalIds || !existingObservationGoalIds.includes(observationGoalId)) {
                    promises.push(
                        this.deviceService
                            .linkObservationGoal(this.deviceId, sensorId, datastreamId, observationGoalId)
                            .toPromise(),
                    );
                }
            }
            if (existingObservationGoalIds) {
                for (const existingObservationGoalId of existingObservationGoalIds) {
                    if (!observationGoalIds.includes(existingObservationGoalId)) {
                        promises.push(
                            this.deviceService
                                .unlinkObservationGoal(this.deviceId, sensorId, datastreamId, existingObservationGoalId)
                                .toPromise(),
                        );
                    }
                }
            }
        }

        await Promise.all(promises);
    }

    public async saveSensors() {
        const sensors = this.sensorForm.get('sensors') as FormArray;

        let failed = false;
        for (const sensorEntry of sensors.controls) {
            const sensorEntryValue = sensorEntry.value;
            if (!sensorEntryValue.id) {
                const sensor: IRegisterSensorBody = {
                    name: sensorEntryValue.name,
                    description: sensorEntryValue.description,
                    type: sensorEntryValue.typeName.value,
                    manufacturer: sensorEntryValue.manufacturer,
                    supplier: sensorEntryValue.supplier,
                    documentation: sensorEntryValue.documentation,
                };

                try {
                    const sensorResult: Record<string, any> = await this.deviceService
                        .registerSensor(this.deviceId, sensor)
                        .toPromise();
                    sensorEntry.patchValue({ id: sensorResult.sensorId });
                } catch (e) {
                    failed = true;
                    this.alertService.error(e.error.message);
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
                    sensorUpdate.type = sensorEntryValue.typeName.value;
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

                try {
                    if (Object.keys(sensorUpdate).length) {
                        await this.deviceService
                            .updateSensor(this.deviceId, sensorEntryValue.id, sensorUpdate as IUpdateSensorBody)
                            .toPromise();
                        this.sensorForm.markAsPristine();
                        this.alertService.success(this.saveSuccessMessage);
                    }
                } catch (e) {
                    this.alertService.error(e.error.message);
                }

                this.submitted = false;
            }
        }

        if (!failed) {
            this.alertService.success(this.saveSuccessMessage);
        }

        this.submitted = false;
    }

    public async saveDatastreams() {
        const sensors = this.sensorForm.get('sensors') as FormArray;

        let failed = false;
        for (const sensorEntry of sensors.controls) {
            const sensorId = sensorEntry.value.id;

            const datastreams = sensorEntry.get('datastreams') as FormArray;
            for (const datastreamEntry of datastreams.controls) {
                const datastreamFormValue = datastreamEntry.value;
                const datastream: IRegisterDatastreamBody = {
                    name: datastreamFormValue.name,
                    description: datastreamFormValue.description,
                    theme: datastreamFormValue.theme ? datastreamFormValue.theme.value : null,
                    dataQuality: datastreamFormValue.dataQuality,
                    isActive: datastreamFormValue.isActive,
                    isPublic: datastreamFormValue.isPublic,
                    isOpenData: datastreamFormValue.isOpenData,
                    containsPersonalInfoData: datastreamFormValue.containsPersonalInfoData,
                    isReusable: datastreamFormValue.isReusable,
                    documentation: datastreamFormValue.documentation,
                    dataLink: datastreamFormValue.dataLink,
                    observedArea: datastreamFormValue.observedArea,
                };

                try {
                    const datastreamId = datastreamEntry.value.id;
                    if (sensorId && !datastreamId) {
                        try {
                            const datastreamResult: Record<string, any> = await this.deviceService
                                .registerDatastream(this.deviceId, sensorId, datastream)
                                .toPromise();
                            datastreamEntry.patchValue({ id: datastreamResult.datastreamId });

                            if (datastreamFormValue.observationGoals) {
                                for (const observationGoal of datastreamFormValue.observationGoals) {
                                    await this.deviceService
                                        .linkObservationGoal(
                                            this.deviceId,
                                            sensorId,
                                            datastreamResult.datastreamId,
                                            observationGoal._id,
                                        )
                                        .toPromise();
                                }
                            }
                        } catch (e) {
                            failed = true;
                            this.alertService.error(e.error.message);
                        }
                    } else {
                        const datastreamUpdate: Record<string, any> = {};
                        if (datastreamEntry.get('name').dirty) {
                            datastreamUpdate.name = datastreamFormValue.name;
                        }
                        if (datastreamEntry.get('description').dirty) {
                            datastreamUpdate.description = datastreamFormValue.description;
                        }
                        if (datastreamEntry.get('theme').dirty) {
                            datastreamUpdate.theme = datastreamFormValue.theme ? datastreamFormValue.theme.value : null;
                        }
                        if (datastreamEntry.get('dataQuality').dirty) {
                            datastreamUpdate.dataQuality = datastreamFormValue.dataQuality;
                        }
                        if (datastreamEntry.get('isActive').dirty) {
                            datastreamUpdate.isActive = datastreamFormValue.isActive;
                        }
                        if (datastreamEntry.get('isPublic').dirty) {
                            datastreamUpdate.isPublic = datastreamFormValue.isPublic;
                        }
                        if (datastreamEntry.get('isOpenData').dirty) {
                            datastreamUpdate.isOpenData = datastreamFormValue.isOpenData;
                        }
                        if (datastreamEntry.get('containsPersonalInfoData').dirty) {
                            datastreamUpdate.containsPersonalInfoData = datastreamFormValue.containsPersonalInfoData;
                        }
                        if (datastreamEntry.get('isReusable').dirty) {
                            datastreamUpdate.isReusable = datastreamFormValue.isReusable;
                        }
                        if (datastreamEntry.get('documentation').dirty) {
                            datastreamUpdate.documentation = datastreamFormValue.documentation;
                        }
                        if (datastreamEntry.get('dataLink').dirty) {
                            datastreamUpdate.dataLink = datastreamFormValue.dataLink;
                        }
                        if (datastreamEntry.get('observedArea').dirty) {
                            datastreamUpdate.observedArea = datastreamFormValue.observedArea;
                        }

                        if (datastreamFormValue.observationGoals) {
                            const observationGoalIds = datastreamFormValue.observationGoals.map((x) => x._id);
                            await this.updateObservationGoals(sensorId, datastreamId, observationGoalIds);
                        }

                        if (Object.keys(datastreamUpdate).length) {
                            await this.deviceService
                                .updateDatastream(
                                    this.deviceId,
                                    sensorId,
                                    datastreamId,
                                    datastreamUpdate as IUpdateDatastreamBody,
                                )
                                .toPromise();
                            this.sensorForm.markAsPristine();
                        }

                        this.submitted = false;
                        this.alertService.success(this.saveSuccessMessage, false, 4000);
                    }
                } catch (e) {
                    this.alertService.error(e.error.message, false, 4000);
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
            category: null,
            name: [null, [Validators.required, Validators.minLength(6)]],
            connectivity: null,
            description: null,
            location: [],
            locationName: null,
            locationDescription: null,
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
            ],
            [this.sensorForm.controls.sensors],
            [this.sensorForm.controls.sensors],
        ];

        this.subscriptions.push(
            this.route.params.subscribe(async (params) => {
                if (params.id) {
                    const device = await this.deviceService.get(params.id).toPromise();
                    if (device) {
                        this.deviceId = params.id;
                        this.setDevice(device as IDevice);
                    }

                    this.locationService.showLocation(null);
                }
            }),
        );
    }

    public ngOnDestroy(): void {
        this.subscriptions.forEach((x) => x.unsubscribe());
    }
}
