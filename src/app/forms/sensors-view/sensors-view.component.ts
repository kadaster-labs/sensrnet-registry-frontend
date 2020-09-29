import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { SensorService } from '../../services/sensor.service';
import { MapComponent } from '../../components/map/map.component';

@Component({
  selector: 'app-sensors-view',
  templateUrl: './sensors-view.component.html',
  styleUrls: ['./sensors-view.component.scss'],
})
export class SensorsViewComponent implements OnInit {

  public sensors;
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
    this.sensors = await this.sensorService.getSensors(false);
  }
}
