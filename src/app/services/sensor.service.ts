import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Sensor, Theme, TypeBeacon } from './../model/sensor';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class SensorService {
  backendUrl: string = 'http://localhost:3000/Sensor'
  sensor: Sensor[] = [
    {
      name: 'Jeroen Grift',
      aim: "test",
      description: "test",
      manufacturer: "Kadaster",
      active: true,
      observationArea: "test",
      documentationUrl: "www.kadaster.nl",
      dataStreams: [{
        name: "test",
        reason: "test",
        description: "test",
        observedProperty: "test",
        unitOfMeasurement: "test",
        isPublic: true,
        isOpenData: true,
        isReusable: true,
        documentationUrl: "www.kadaster.nl",
        datalink: "www.kadaster.nl",
        dataFrequency: 0,
        dataQuality: 0
      }],
      location: {
        x: 100000,
        y: 100000,
        z: 10,
        epsgCode: 28992,
        basObjectId: "test"
      },
      theme: Theme.Wheather,
      typeName: TypeBeacon.NavigationBeacon,
      typeDetails: "test"
    }
  ];

  constructor(private http: HttpClient) {
  }

  getAllSensors() {
    return this.http.get(this.backendUrl).subscribe(
      (data) => {
        console.log(data)
      },
      (err: HttpErrorResponse) => {
        console.log(err.message);
      }
    )
  }

  getGeoJsonSensors() { }

  getSensorById() { }

  registerSensor() { }

  updateSensorDetails() { }

  removeSensor() { }

  transferOwnership() { }

  shareOwnership() { }

  deactivateSensor() { }

  activateSensorDetails() { }

  relocateSensor() { }

  addDatastreamToSensor() { }

  removeDatastreamFromSensor() { }

}
