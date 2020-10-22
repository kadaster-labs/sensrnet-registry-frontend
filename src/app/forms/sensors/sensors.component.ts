import { Component, OnInit } from '@angular/core';
import { SensorService } from '../../services/sensor.service';

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
  ) {}

  public sortByAttribute(attribute) {
    this.ascending = !this.ascending;
    this.sensors.sort((a, b) => (a[attribute] > b[attribute]) ? 1 : (a[attribute] === b[attribute]) ? ((a[attribute] >
      b[attribute]) ? 1 : -1) : -1 );
    if (!this.ascending) {
      this.sensors.reverse();
    }
  }

  public async ngOnInit(): Promise<void> {
    this.sensors = await this.sensorService.getMySensors();
  }
}
