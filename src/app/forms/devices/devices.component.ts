import {Component, OnDestroy, OnInit} from '@angular/core';
import { DeviceService, IUpdateDeviceBody } from '../../services/device.service';
import { LocationService } from '../../services/location.service';
import {getCategoryTranslation} from '../../model/bodies/sensorTypes';
import {LegalEntityService} from '../../services/legal-entity.service';
import {IDevice} from '../../model/bodies/device-model';
import {Router} from '@angular/router';
import {ModalService} from '../../services/modal.service';
import {AlertService} from '../../services/alert.service';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {OidcSecurityService} from 'angular-auth-oidc-client';
import {ConnectionService} from '../../services/connection.service';

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
  public sortDirections = {ASCENDING: 'ASCENDING', DESCENDING: 'DESCENDING'};
  public sortDirection = this.sortDirections.ASCENDING;

  public getCategoryTranslation = getCategoryTranslation;

  public showLocation = false;
  private filterChanged: Subject<string> = new Subject<string>();

  public confirmTitleString = $localize`:@@confirm.title:Please confirm`;
  public joinOrganizationString = $localize`:@@join.organization:You need to join an organization first.`;
  public confirmUpdateString = $localize`:@@update.device.confirm.body:Do you really want to update the devices?`;
  public confirmDeleteBodyString = $localize`:@@delete.device.confirm.body:Do you really want to delete the device?`;

  constructor(
    private readonly router: Router,
    private readonly modalService: ModalService,
    private readonly alertService: AlertService,
    private readonly deviceService: DeviceService,
    private readonly locationService: LocationService,
    private readonly legalEntityService: LegalEntityService,
    private connectionService: ConnectionService,
    private oidcSecurityService: OidcSecurityService,
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
      this.sortDirection = (this.sortDirection === this.sortDirections.ASCENDING ?
        this.sortDirections.DESCENDING : this.sortDirections.ASCENDING);
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
      this.devices = await this.deviceService.getMyDevices(this.legalEntity._id, pageIndex, this.pageSize,
        this.sortField, this.sortDirection, name);
    } else {
      this.devices = [];
    }

    this.pageIndex = pageIndex;
  }

  public async editDevice(deviceId: string): Promise<void> {
    await this.router.navigate([`/device/${deviceId}`]);
  }

  public async deleteDevice(deviceId: string): Promise<void> {
    const confirmed = await this.modalService.confirm(this.confirmTitleString, this.confirmDeleteBodyString);
    if (confirmed) {
      try {
        await this.deviceService.unregister(deviceId);
        await this.getPage(this.pageIndex);
      } catch (e) {
        this.alertService.error(e.error.message);
      }
    }
  }

  public toggleLocation() {
    this.showLocation = !this.showLocation;
  }

  public toggleDevice(sensorId: string) {
    if (this.selectedDeviceIds.includes(sensorId)) {
      this.selectedDeviceIds = this.selectedDeviceIds.filter(x => x !== sensorId);
    } else {
      this.selectedDeviceIds.push(sensorId);
    }
  }

  public selectDevice(sensorId: string) {
    if (!this.selectedDeviceIds.includes(sensorId)) {
      this.selectedDeviceIds.push(sensorId);
    }
  }

  public async updateDevice(e, field) {
    const confirmed = await this.modalService.confirm(this.confirmTitleString, this.confirmUpdateString);
    if (confirmed) {
      const promises = [];
      for (const deviceId of this.selectedDeviceIds) {
        let updateBody: IUpdateDeviceBody;
        if (field === 'name') {
          updateBody = {
            name: e.target.value,
          };
        } else if (field === 'connectivity') {
          updateBody = {
            connectivity: e.target.value,
          };
        } else if (field === 'description') {
          updateBody = {
            description: e.target.value,
          };
        } else if (field === 'location') {
          const latitude = e.length > 0 ? e[0] : null;
          const longitude = e.length > 1 ? e[1] : null;
          const location = [longitude, latitude];

          for (const device of this.devices) {
            if (device._id === deviceId && device.location.coordinates.length > 2) {
              location.push(device.location.coordinates[2]);
              break;
            }
          }

          updateBody = {
            location: { location }
          };
        }

        if (updateBody) {
          promises.push(this.deviceService.update(deviceId, updateBody).toPromise());
        }
      }

      await Promise.all(promises);
    }
  }

  filterInputChanged(name) {
    this.filterChanged.next(name);
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

    this.subscriptions.push(this.oidcSecurityService.checkAuth().subscribe((auth: boolean) => {
      if (auth) {
        this.connectionService.refreshLegalEntity();
      }
    }));

    this.subscriptions.push(
      this.locationService.location$.subscribe(location => {
        if (this.showLocation && location.coordinates) {
          this.updateDevice(location.coordinates, 'location');
        }
      })
    );

    this.subscriptions.push(this.filterChanged
      .pipe(debounceTime(750))
      .subscribe(name => this.getPage(this.pageIndex, name)));

    const { onUpdate, onRemove } = await this.deviceService.subscribe();

    this.subscriptions.push(onUpdate.subscribe((updatedDevice: IDevice) => {
      for (let i = 0; i < this.devices.length; i++) {
        const device = this.devices[i];
        if (device._id === updatedDevice._id) {
          this.devices[i] = updatedDevice;
        }
      }
    }));

    this.subscriptions.push(onRemove.subscribe(_ => this.getPage(this.pageIndex)));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
  }
}
