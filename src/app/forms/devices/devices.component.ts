import { Component, OnInit } from '@angular/core';
import { DeviceService } from '../../services/device.service';
import { LocationService } from '../../services/location.service';
import { getCategoryTranslation } from '../../model/bodies/sensorTypes';
import {LegalEntityService} from '../../services/legal-entity.service';
import {IDevice} from '../../model/bodies/device-model';
import {Router} from '@angular/router';
import {ModalService} from '../../services/modal.service';
import {AlertService} from '../../services/alert.service';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss'],
})
export class DevicesComponent implements OnInit {
  public legalEntity;
  public devices: IDevice[] = [];

  public pageIndex = 0;
  public pageSize = 15;

  public sortField = 'name';
  public sortDirections = {ASCENDING: 'ASCENDING', DESCENDING: 'DESCENDING'};
  public sortDirection = this.sortDirections.ASCENDING;

  public getCategoryTranslation = getCategoryTranslation;

  public confirmTitleString = $localize`:@@confirm.title:Please confirm`;
  public confirmBodyString = $localize`:@@delete.device.confirm.body:Do you really want to delete the device?`;
  public joinOrganizationString = $localize`:@@join.organization:You need to join an organization first.`;

  constructor(
    private readonly router: Router,
    private readonly modalService: ModalService,
    private readonly alertService: AlertService,
    private readonly deviceService: DeviceService,
    private readonly locationService: LocationService,
    private readonly legalEntityService: LegalEntityService,
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

  public async getPage(pageIndex) {
    if (this.legalEntity && this.legalEntity._id) {
      this.devices = await this.deviceService.getMyDevices(this.legalEntity._id, pageIndex, this.pageSize,
        this.sortField, this.sortDirection);
    } else {
      this.devices = [];
    }

    this.pageIndex = pageIndex;
  }

  public async editDevice(deviceId: string): Promise<void> {
    await this.router.navigate([`/device/${deviceId}`]);
  }

  public async deleteDevice(deviceId: string): Promise<void> {
    const confirmed = await this.modalService.confirm(this.confirmTitleString, this.confirmBodyString);
    if (confirmed) {
      try {
        await this.deviceService.unregister(deviceId);
      } catch (e) {
        this.alertService.error(e.error.message);
      }
    }
  }

  public selectDevice(sensor: IDevice) {
    this.locationService.highlightLocation({
      type: 'Point',
      coordinates: sensor.location.coordinates
    });
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
  }
}
