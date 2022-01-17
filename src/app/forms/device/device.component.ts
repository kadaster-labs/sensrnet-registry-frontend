import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import { IObservedAreaDTO, ObservedAreaService } from '../../services/observed-area.service';

@Component({
    selector: 'app-device',
    templateUrl: './device.component.html',
    styleUrls: ['./device.component.scss'],
})
export class DeviceComponent implements OnInit, OnDestroy {
    public deviceId: string;
    public device: IDevice;

    public submitted = false;
    public activeStepIndex = 0;

    public subscriptions: Subscription[] = [];

    private submitting = false;
    public deviceForm: FormGroup;
    public sensorForm: FormGroup;

    public formControlSteps: Array<Array<any>>;

    public saveSuccessMessage = $localize`:@@device.register.success:Saved!`;
    public formInvalidMessage = $localize`:@@form.register.invalid:The form is invalid`;
    public saveBodyString = $localize`:@@step.confirm.body:You need to save before continuing`;
    public saveFailedMessage = $localize`:@@device.register.failure:An error has occurred during saving:`;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly formBuilder: FormBuilder,
        private readonly alertService: AlertService,
        private readonly deviceService: DeviceService,
        private readonly locationService: LocationService,
        private readonly observedAreaService: ObservedAreaService,
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

    public setDevice(device) {
        this.device = device;

        const observedAreas = [];
        if (this.device.datastreams) {
            for (const dataStream of this.device.datastreams) {
                if (dataStream.observationArea) {
                    observedAreas.push(dataStream.observationArea);
                }
            }
        }

        const observedAreaObject: IObservedAreaDTO = {
            observedAreaPolygons: observedAreas,
        };
        this.observedAreaService.showObservedAreas(observedAreaObject);
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

    public async initDeviceForm(device: IDevice): Promise<void> {
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
                                unitOfMeasurement: datastream.unitOfMeasurement,
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
                    typeName: [sensor.type, Validators.required],
                    manufacturer: sensor.manufacturer,
                    supplier: sensor.supplier,
                    documentation: [sensor.documentation, [Validators.pattern(urlRegex)]],
                    datastreams,
                }),
            );
        }
        this.sensorForm.markAsPristine();
    }

    public async saveDevice() {
        if (this.deviceForm.value.id) {
            await this.updateDevice();
        } else {
            if (this.submitting) {
                return;
            }
            this.submitting = true;
            await this.createDevice();
            this.submitting = false;
            await this.router.navigate([`/device/${this.deviceId}`]);
        }
    }

    private async updateDevice() {
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
    }

    private async createDevice() {
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
                    type: sensorEntryValue.typeName,
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

                try {
                    if (Object.keys(sensorUpdate).length) {
                        await this.deviceService
                            .updateSensor(this.deviceId, sensorEntryValue.id, sensorUpdate as IUpdateSensorBody)
                            .toPromise();
                        this.alertService.success(this.saveSuccessMessage);
                    }
                } catch (e) {
                    this.alertService.error(e.error.message);
                }

                this.submitted = false;
            }
        }

        if (!failed) {
            this.sensorForm.markAsPristine();
            this.alertService.success(this.saveSuccessMessage);
        }

        this.submitted = false;
    }

    public async registerDatastream(sensorId, datastream, datastreamFormEntry, datastreamFormValue) {
        const datastreamResult: Record<string, any> = await this.deviceService
            .registerDatastream(this.deviceId, sensorId, datastream)
            .toPromise();
        datastreamFormEntry.patchValue({ id: datastreamResult.datastreamId });

        if (datastreamFormValue.observationGoals) {
            for (const observationGoal of datastreamFormValue.observationGoals) {
                await this.deviceService
                    .linkObservationGoal(this.deviceId, sensorId, datastreamResult.datastreamId, observationGoal._id)
                    .toPromise();
            }
        }
    }

    public async updateDatastream(sensorId, datastreamId, datastreamFormEntry, datastreamFormValue) {
        const fieldsToUpdate = [
            'name',
            'description',
            'dataQuality',
            'isActive',
            'isPublic',
            'isOpenData',
            'containsPersonalInfoData',
            'isReusable',
            'documentation',
            'dataLink',
            'observedArea',
            'unitOfMeasurement',
        ];

        const datastreamUpdate: Record<string, any> = {};
        if (datastreamFormEntry.get('theme').dirty) {
            datastreamUpdate.theme = datastreamFormValue.theme ? datastreamFormValue.theme.value : null;
        }
        for (const field of fieldsToUpdate) {
            if (datastreamFormEntry.get(field).dirty) {
                datastreamUpdate[field] = datastreamFormValue[field];
            }
        }
        if (datastreamFormValue.observationGoals) {
            const observationGoalIds = datastreamFormValue.observationGoals.map((x) => x._id);
            await this.updateObservationGoals(sensorId, datastreamId, observationGoalIds);
        }

        if (Object.keys(datastreamUpdate).length) {
            await this.deviceService
                .updateDatastream(this.deviceId, sensorId, datastreamId, datastreamUpdate as IUpdateDatastreamBody)
                .toPromise();
        }
    }

    public async saveSensorDatastreams(sensorId, datastreamsFormArray) {
        for (const datastreamFormEntry of datastreamsFormArray['controls']) {
            const datastreamFormValue = datastreamFormEntry.value;
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
                unitOfMeasurement: datastreamFormValue.unitOfMeasurement,
            };

            const datastreamId = datastreamFormEntry.value.id;
            if (sensorId && !datastreamId) {
                await this.registerDatastream(sensorId, datastream, datastreamFormEntry, datastreamFormValue);
            } else {
                await this.updateDatastream(sensorId, datastreamId, datastreamFormEntry, datastreamFormValue);
            }
        }
    }

    public async saveDatastreams() {
        const sensors = this.sensorForm.get('sensors');

        try {
            for (const sensorEntry of sensors['controls']) {
                const datastreamsFormArray = sensorEntry.get('datastreams');
                await this.saveSensorDatastreams(sensorEntry.value.id, datastreamsFormArray);
            }

            this.sensorForm.markAsPristine();
            this.alertService.success(this.saveSuccessMessage, false, 4000);
        } catch (e) {
            this.alertService.error(e.error.message, false, 4000);
        } finally {
            this.submitted = false;
        }
    }

    public async ngOnInit() {
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
                    this.deviceId = params.id;
                    const device = (await this.deviceService.get(this.deviceId).toPromise()) as IDevice;

                    this.setDevice(device);
                    await this.initDeviceForm(device);
                    this.locationService.showLocation(null);
                }
            }),
        );

        const { onLocate, onUpdate } = await this.deviceService.subscribe();

        const handler = (newDevice: IDevice) => {
            if (newDevice._id === this.deviceId) {
                this.setDevice(newDevice);
            }
        };
        this.subscriptions.push(onLocate.subscribe(handler), onUpdate.subscribe(handler));
    }

    public ngOnDestroy(): void {
        this.observedAreaService.hideObservedAreas();
        this.subscriptions.forEach((x) => x.unsubscribe());
    }
}
