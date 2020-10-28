import { Component, OnInit } from '@angular/core';
import { ISensor } from '../../model/bodies/sensor-body';
import { SensorService } from '../../services/sensor.service';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.scss'],
})
export class SensorsComponent implements OnInit {

  public sensors = [];
  public ascending = true;

  constructor(
    public sensorService: SensorService,
    private readonly locationService: LocationService,
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
  }
}
