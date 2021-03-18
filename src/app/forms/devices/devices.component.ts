import { Component, OnInit } from '@angular/core';
import { ISensor } from '../../model/bodies/sensor-body';
import { DeviceService } from '../../services/device.service';
import { LocationService } from '../../services/location.service';
import { getCategoryTranslation } from '../../model/bodies/sensorTypes';
import {LegalEntityService} from '../../services/legal-entity.service';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss'],
})
export class DevicesComponent implements OnInit {
  public devices = [];
  public ascending = true;
  public legalEntity;

  public pageIndex = 0;
  public pageSize = 15;

  public getCategoryTranslation = getCategoryTranslation;

  constructor(
    private readonly deviceService: DeviceService,
    private readonly locationService: LocationService,
    private readonly legalEntityService: LegalEntityService,
  ) {}

  public sortByAttribute(attribute) {
    const toString = attribute === 'category' ? x => getCategoryTranslation(x) : x => x;

    this.ascending = !this.ascending;
    this.devices.sort((a, b) => {
      const aString = toString(a[attribute]);
      const bString = toString(b[attribute]);
      return aString > bString ? 1 : (aString === bString) ? ((aString > bString) ? 1 : -1) : -1;
    });

    if (!this.ascending) {
      this.devices.reverse();
    }
  }

  public async getPreviousPage() {
    if (this.pageIndex > 0) {
      await this.getPage(this.pageIndex - 1);
    }
  }

  public async getNextPage() {
    await this.getPage(this.pageIndex + 1);
  }

  public async getPage(pageIndex) {
    this.pageIndex = pageIndex;

    if (this.legalEntity && this.legalEntity._id) {
      this.devices = await this.deviceService.getMyDevices(this.legalEntity._id, this.pageIndex, this.pageSize);
    } else {
      this.devices = [];
    }
  }

  public selectDevice(sensor: ISensor) {
    this.locationService.highlightLocation({
      type: 'Point',
      coordinates: sensor.location.coordinates
    });
  }

  public async ngOnInit(): Promise<void> {
    this.legalEntity = await this.legalEntityService.get().toPromise();

    await this.getPage(0);
  }
}
