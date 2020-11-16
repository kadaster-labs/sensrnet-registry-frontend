import { Claim } from '../../model/claim';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ISensor } from '../../model/bodies/sensor-body';
import { SensorService } from '../../services/sensor.service';
import { LocationService } from '../../services/location.service';
import { ConnectionService } from '../../services/connection.service';

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

  constructor(
    public sensorService: SensorService,
    private readonly locationService: LocationService,
    private readonly connectionService: ConnectionService,
  ) {}

  public sortByAttribute(attribute) {
    this.ascending = !this.ascending;
    this.sensors.sort((a, b) => (a[attribute] > b[attribute]) ? 1 : (a[attribute] === b[attribute]) ? ((a[attribute] >
      b[attribute]) ? 1 : -1) : -1 );
    if (!this.ascending) {
      this.sensors.reverse();
    }
  }

  public selectSensor(sensor: ISensor) {
    this.locationService.highlightLocation({
      type: 'Point',
      coordinates: sensor.location.coordinates,
      baseObjectId: 'placeholder'
    });
  }

  public async ngOnInit(): Promise<void> {
    this.sensors = await this.sensorService.getMySensors();

    this.subscriptions.push(this.connectionService.claim$.subscribe(async (claim: Claim) => {
      if (claim && claim.organizationId) {
        this.organizationId = claim.organizationId;
      } else {
        this.organizationId = null;
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
