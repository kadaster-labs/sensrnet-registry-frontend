import { Claims } from '../../model/claim';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ISensor } from '../../model/bodies/sensor-body';
import { SensorService } from '../../services/sensor.service';
import { LocationService } from '../../services/location.service';
import { ConnectionService } from '../../services/connection.service';
import { getCategoryTranslation, getTypeTranslation } from '../../model/bodies/sensorTypes';

@Component({
  selector: 'app-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.scss'],
})
export class SensorsComponent implements OnInit, OnDestroy {
  public sensors = [];
  public ascending = true;

  public organizationId;
  public subscriptions = [];

  public getTypeTranslation = getTypeTranslation;
  public getCategoryTranslation = getCategoryTranslation;

  constructor(
    public sensorService: SensorService,
    private readonly locationService: LocationService,
    private readonly connectionService: ConnectionService,
  ) {}

  public sortByAttribute(attribute) {
    let toString;
    if (attribute === 'category') {
      toString = x => getCategoryTranslation(x);
    } else if (attribute === 'typeName') {
      toString = x => getTypeTranslation(x);
    } else {
      toString = x => x;
    }

    this.ascending = !this.ascending;
    this.sensors.sort((a, b) => {
      const aString = toString(a[attribute]);
      const bString = toString(b[attribute]);
      return aString > bString ? 1 : (aString === bString) ? ((aString > bString) ? 1 : -1) : -1;
    });

    if (!this.ascending) {
      this.sensors.reverse();
    }
  }

  public selectSensor(sensor: ISensor) {
    this.locationService.highlightLocation({
      type: 'Point',
      coordinates: sensor.location.coordinates
    });
  }

  public async ngOnInit(): Promise<void> {
    this.sensors = await this.sensorService.getMySensors();

    this.subscriptions.push(this.connectionService.claim$.subscribe(async (claims: Claims) => {
      if (claims && claims.organizationId) {
        this.organizationId = claims.organizationId;
      } else {
        this.organizationId = null;
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
