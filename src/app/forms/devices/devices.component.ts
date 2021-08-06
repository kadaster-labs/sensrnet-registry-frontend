import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { IDevice } from '../../model/bodies/device-model';
import { getCategoryTranslation, Category } from '../../model/bodies/sensorTypes';
import { AlertService } from '../../services/alert.service';
import { ConnectionService } from '../../services/connection.service';
import { DeviceService, IUpdateDeviceBody } from '../../services/device.service';
import { LegalEntityService } from '../../services/legal-entity.service';
import { LocationService } from '../../services/location.service';
import { ModalService } from '../../services/modal.service';

@Component({
    selector: 'app-devices',
    templateUrl: './devices.component.html',
    styleUrls: ['./devices.component.scss'],
})
export class DevicesComponent implements OnInit, OnDestroy {
    public legalEntity;
    public subscriptions = [];
    public devices: IDevice[] = [];
    public selectedDeviceIds: string[] = [];

    public pageIndex = 0;
    public pageSize = 15;

    public sortField = 'name';
    public sortDirections = { ASCENDING: 'ASCENDING', DESCENDING: 'DESCENDING' };
    public sortDirection = this.sortDirections.ASCENDING;

    public sensorCategories = Category;
    public getCategoryTranslation = getCategoryTranslation;

    public showLocation = false;

    public canEdit = false;
    public canDelete = false;
    public canEditLocation = false;

    public devicesTable: FormGroup = this.fb.group({
        tableRows: this.fb.array([]),
    });

    private filterChanged: Subject<string> = new Subject<string>();

    public confirmTitleString = $localize`:@@confirm.title:Please confirm`;
    public formInvalidMessage = $localize`:@@form.register.invalid:The form is invalid`;
    public updatedDevicesString = $localize`:@@updated.devices:Successfully updated device(s).`;
    public joinOrganizationString = $localize`:@@join.organization:You need to join an organization first.`;
    public confirmUpdateString = $localize`:@@update.devices.confirm.body:Do you really want to update the device(s)?`;
    public confirmDeleteBodyString = $localize`:@@delete.devices.confirm.body:Do you really want to delete the device(s)?`;

    constructor(
        private readonly router: Router,
        private readonly fb: FormBuilder,
        private readonly modalService: ModalService,
        private readonly alertService: AlertService,
        private readonly deviceService: DeviceService,
        private readonly locationService: LocationService,
        private readonly connectionService: ConnectionService,
        private readonly legalEntityService: LegalEntityService,
        private readonly oidcSecurityService: OidcSecurityService,
    ) {}

    getSortClass(sortField) {
        let sortClass;
        if (this.sortField === sortField) {
            if (this.sortDirection === this.sortDirections.ASCENDING) {
                sortClass = 'sort-up';
            } else {
                sortClass = 'sort-down';
            }
        } else {
            sortClass = 'sort';
        }

        return sortClass;
    }

    public async setSort(sortField) {
        if (sortField === this.sortField) {
            this.sortDirection =
                this.sortDirection === this.sortDirections.ASCENDING
                    ? this.sortDirections.DESCENDING
                    : this.sortDirections.ASCENDING;
        }

        this.sortField = sortField;
        await this.getPage(this.pageIndex);
    }

    public async getPreviousPage() {
        if (this.pageIndex > 0) {
            await this.getPage(this.pageIndex - 1);
        }
    }

    public async getNextPage() {
        if (this.devices.length === this.pageSize) {
            await this.getPage(this.pageIndex + 1);
        }
    }

    public async getPage(pageIndex, name?) {
        if (this.legalEntity && this.legalEntity._id) {
            this.devices = await this.deviceService.getMyDevices(
                this.legalEntity._id,
                pageIndex,
                this.pageSize,
                this.sortField,
                this.sortDirection,
                name,
            );
        } else {
            this.devices = [];
        }
        this.filterSelectedDevices(this.devices.map((x) => x._id));

        this.devicesTable = this.fb.group({
            tableRows: this.fb.array([]),
        });

        const control = this.devicesTable.get('tableRows') as FormArray;
        this.devices.map((x) => control.push(this.initiateDeviceForm(x)));

        this.pageIndex = pageIndex;
    }

    public initiateDeviceForm(device): FormGroup {
        return this.fb.group({
            id: [device._id],
            name: [device.name, [Validators.required, Validators.minLength(6)]],
            category: [device.category],
            connectivity: [device.connectivity],
            description: [device.description],
        });
    }

    get getFormControls() {
        return this.devicesTable.get('tableRows') as FormArray;
    }

    public async editSelectedDevice(): Promise<void> {
        if (this.selectedDeviceIds) {
            const selectedDeviceId = this.selectedDeviceIds[0];
            await this.router.navigate([`/device/${selectedDeviceId}`]);
        }
    }

    public async deleteSelectedDevices(): Promise<void> {
        if (this.selectedDeviceIds) {
            await this.modalService.confirm(this.confirmTitleString, this.confirmDeleteBodyString).then(
                async () => {
                    try {
                        for (const deviceId of this.selectedDeviceIds) {
                            await this.deviceService.unregister(deviceId);
                        }

                        await this.getPage(this.pageIndex);
                    } catch (e) {
                        this.alertService.error(e.error.message);
                    }
                },
                () => {},
            );
        }
    }

    public toggleLocation() {
        this.showLocation = !this.showLocation;
    }

    public updateActions() {
        const selectedDevicesCount = this.selectedDeviceIds.length;
        if (selectedDevicesCount > 0) {
            this.canDelete = true;
            this.canEditLocation = true;
            this.canEdit = selectedDevicesCount === 1;
        } else {
            this.canEdit = false;
            this.canDelete = false;
            this.canEditLocation = false;
        }
    }

    public toggleDevice(sensorId: string) {
        if (this.selectedDeviceIds.includes(sensorId)) {
            this.selectedDeviceIds = this.selectedDeviceIds.filter((x) => x !== sensorId);
        } else {
            this.selectedDeviceIds.push(sensorId);
        }

        this.updateActions();
    }

    public filterSelectedDevices(deviceIds: string[]) {
        this.selectedDeviceIds = this.selectedDeviceIds.filter((x) => deviceIds.includes(x));

        this.updateActions();
    }

    public selectDevice(sensorId: string) {
        if (!this.selectedDeviceIds.includes(sensorId)) {
            this.selectedDeviceIds.push(sensorId);
        }

        this.updateActions();
    }

    public async updateDeviceLocation(newLocation) {
        await this.modalService.confirm(this.confirmTitleString, this.confirmUpdateString).then(
            async () => {
                const promises = [];
                for (const deviceId of this.selectedDeviceIds) {
                    const latitude = newLocation.length > 0 ? newLocation[0] : null;
                    const longitude = newLocation.length > 1 ? newLocation[1] : null;
                    const location = [longitude, latitude];

                    for (const device of this.devices) {
                        if (device._id === deviceId && device.location.coordinates.length > 2) {
                            location.push(device.location.coordinates[2]);
                            break;
                        }
                    }

                    const updateBody: IUpdateDeviceBody = {
                        location: { location },
                    };

                    if (updateBody) {
                        promises.push(this.deviceService.update(deviceId, updateBody).toPromise());
                    }
                }

                await Promise.all(promises);
                this.alertService.success(this.updatedDevicesString);
            },
            () => {},
        );
    }

    filterInputChanged(name) {
        this.filterChanged.next(name);
    }

    public async saveDevices() {
        if (!this.devicesTable.valid) {
            this.alertService.error(this.formInvalidMessage);
            return;
        }

        await this.modalService.confirm(this.confirmTitleString, this.confirmUpdateString).then(
            async () => {
                const promises = [];

                const devices = this.devicesTable.get('tableRows') as FormArray;
                for (const device of devices.controls) {
                    const deviceId = device.value.id;
                    const updateBody: IUpdateDeviceBody = {};

                    if (device.get('name').dirty) {
                        updateBody.name = device.value.name;
                    }
                    if (device.get('category').dirty) {
                        updateBody.category = device.value.category;
                    }
                    if (device.get('connectivity').dirty) {
                        updateBody.connectivity = device.value.connectivity;
                    }
                    if (device.get('description').dirty) {
                        updateBody.description = device.value.description;
                    }

                    if (Object.keys(updateBody).length) {
                        promises.push(this.deviceService.update(deviceId, updateBody).toPromise());
                    }
                }

                await Promise.all(promises);
                this.devicesTable.markAsPristine();

                this.alertService.success(this.updatedDevicesString);
            },
            () => {},
        );
    }

    public async registerDevice() {
        if (this.legalEntity) {
            await this.router.navigate(['/device']);
        } else {
            this.alertService.error(this.joinOrganizationString);
        }
    }

    public async ngOnInit(): Promise<void> {
        this.legalEntity = await this.legalEntityService.get().toPromise();
        await this.getPage(0);

        this.subscriptions.push(
            this.oidcSecurityService.checkAuth().subscribe((auth: boolean) => {
                if (auth) {
                    this.connectionService.refreshLegalEntity();
                }
            }),
        );

        this.subscriptions.push(
            this.locationService.location$.subscribe((location) => {
                if (this.showLocation && location.coordinates) {
                    this.updateDeviceLocation(location.coordinates);
                }
            }),
        );

        this.subscriptions.push(
            this.filterChanged.pipe(debounceTime(750)).subscribe((name) => this.getPage(this.pageIndex, name)),
        );

        const { onUpdate, onRemove } = await this.deviceService.subscribe();

        this.subscriptions.push(
            onUpdate.subscribe((updatedDevice: IDevice) => {
                for (let i = 0; i < this.devices.length; i++) {
                    const device = this.devices[i];
                    if (device._id === updatedDevice._id) {
                        this.devices[i] = updatedDevice;
                    }
                }
            }),
        );

        this.subscriptions.push(onRemove.subscribe((_) => this.getPage(this.pageIndex)));
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((x) => x.unsubscribe());
    }
}
