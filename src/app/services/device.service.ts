import { EnvService } from './env.service';
import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { ISensor } from '../model/bodies/sensor-body';
import { EventType } from '../model/events/event-type';
import { ConnectionService } from './connection.service';
import { SensorTheme } from '../model/bodies/sensorTheme';
import { HttpClient, HttpParams } from '@angular/common/http';
import {IDevice, ILocationDetails} from '../model/bodies/device-model';

export interface IRegisterLocationBody {
  location: number[];
  name?: string;
  description?: string;
}

export interface IUpdateLocationBody {
  location?: number[];
  name?: string;
  description?: string;
}

export interface IRegisterDeviceBody {
  _id?: string;
  name: string;
  description?: string;
  category?: string;
  connectivity?: string;
  location: IRegisterLocationBody;
}

export interface IUpdateDeviceBody {
  _id?: string;
  name?: string;
  description?: string;
  category?: string;
  connectivity?: string;
  location: IUpdateLocationBody;
}

export interface IRegisterSensorBody {
  _id?: string;
  name: string;
  description?: string;
  type?: string;
  manufacturer?: string;
  supplier?: string;
  documentation?: string;
}

export interface IUpdateSensorBody {
  _id?: string;
  name?: string;
  description?: string;
  type?: string;
  manufacturer?: string;
  supplier?: string;
  documentation?: string;
}

export interface IRegisterDataStreamBody {
  _id?: string;
  name: string;
  description?: string;
  unitOfMeasurement?: Record<string, any>;
  observedArea?: Record<string, any>;
  theme?: string[];
  dataQuality?: string;
  isActive?: boolean;
  isPublic?: boolean;
  isOpenData?: boolean;
  containsPersonalInfoData?: boolean;
  isReusable?: boolean;
  documentation?: string;
  dataLink?: string;
}

export interface IUpdateDataStreamBody {
  _id?: string;
  name?: string;
  description?: string;
  unitOfMeasurement?: Record<string, any>;
  observedArea?: Record<string, any>;
  theme?: string[];
  dataQuality?: string;
  isActive?: boolean;
  isPublic?: boolean;
  isOpenData?: boolean;
  containsPersonalInfoData?: boolean;
  isReusable?: boolean;
  documentation?: string;
  dataLink?: string;
}

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private deviceLocated$: Observable<IDevice>;
  private deviceUpdated$: Observable<IDevice>;
  private deviceRemoved$: Observable<IDevice>;

  constructor(
    private http: HttpClient,
    private env: EnvService,
    private connectionService: ConnectionService,
  ) {}

  public async subscribe() {
    // This way multiple calls to subscribe do not create new observables.
    if (!this.deviceLocated$ || !this.deviceUpdated$ || !this.deviceRemoved$) {
      const deviceUpdated$ = this.connectionService.subscribeTo(EventType.DeviceUpdated);
      const deviceRemoved$ = this.connectionService.subscribeTo(EventType.DeviceRemoved);
      const deviceLocated$ = this.connectionService.subscribeTo(EventType.DeviceLocated);

      this.deviceLocated$ = new Observable((observer: Subscriber<IDevice>) => {
        deviceLocated$.subscribe((sensor: IDevice) => {
          observer.next(sensor);
        });
      });

      this.deviceUpdated$ = new Observable((observer: Subscriber<IDevice>) => {
        const updateFunction = (sensor: IDevice) => {
          observer.next(sensor);
        };
        deviceUpdated$.subscribe(updateFunction);
      });

      this.deviceRemoved$ = new Observable((observer: Subscriber<IDevice>) => {
        deviceRemoved$.subscribe((sensor: IDevice) => {
          observer.next(sensor);
        });
      });
    }

    return { onLocate: this.deviceLocated$, onUpdate: this.deviceUpdated$, onRemove: this.deviceRemoved$ };
  }

  /** Register device */
  public register(device: IRegisterDeviceBody) {
    return this.http.post(`${this.env.apiUrl}/device`, device);
  }

  public update(deviceId: string, device: IUpdateDeviceBody) {
    return this.http.put(`${this.env.apiUrl}/device/${deviceId}`, device);
  }

  public registerSensor(deviceId: string, sensor: IRegisterSensorBody) {
    return this.http.post(`${this.env.apiUrl}/device/${deviceId}/sensor`, sensor);
  }

  public updateSensor(deviceId: string, sensorId: string, sensor: IUpdateSensorBody) {
    return this.http.put(`${this.env.apiUrl}/device/${deviceId}/sensor/${sensorId}`, sensor);
  }

  public removeSensor(deviceId: string, sensorId: string) {
    return this.http.delete(`${this.env.apiUrl}/device/${deviceId}/sensor/${sensorId}`);
  }

  public registerDataStream(deviceId: string, sensorId: string, dataStream: IRegisterDataStreamBody) {
    return this.http.post(`${this.env.apiUrl}/device/${deviceId}/sensor/${sensorId}/datastream`, dataStream);
  }

  public updateDataStream(deviceId: string, sensorId: string, dataStreamId: string,
                          dataStream: IUpdateDataStreamBody) {
    return this.http.put(`${this.env.apiUrl}/device/${deviceId}/sensor/${sensorId}/datastream/${dataStreamId}`,
      dataStream);
  }

  public removeDataStream(deviceId: string, sensorId: string, dataStreamId: string) {
    return this.http.delete(`${this.env.apiUrl}/device/${deviceId}/sensor/${sensorId}/datastream/${dataStreamId}`);
  }

  /** Retrieve sensors */
  public async getSensors(bottomLeftLongitude?: string, bottomLeftLatitude?: string, upperRightLongitude?: string,
                          upperRightLatitude?: string) {
    let params = new HttpParams();
    if (bottomLeftLongitude) {
      params = params.set('bottomLeftLongitude', bottomLeftLongitude);
    }
    if (bottomLeftLatitude) {
      params = params.set('bottomLeftLatitude', bottomLeftLatitude);
    }
    if (upperRightLongitude) {
      params = params.set('upperRightLongitude', upperRightLongitude);
    }
    if (upperRightLatitude) {
      params = params.set('upperRightLatitude', upperRightLatitude);
    }

    const url = `${this.env.apiUrl}/sensor?${params.toString()}`;
    const sensorPromise = this.http.get(url).toPromise();
    return await sensorPromise as ISensor[];
  }

  public async getDevices(bottomLeftLongitude?: string, bottomLeftLatitude?: string, upperRightLongitude?: string,
                          upperRightLatitude?: string) {
    let params = new HttpParams();
    if (bottomLeftLongitude) {
      params = params.set('bottomLeftLongitude', bottomLeftLongitude);
    }
    if (bottomLeftLatitude) {
      params = params.set('bottomLeftLatitude', bottomLeftLatitude);
    }
    if (upperRightLongitude) {
      params = params.set('upperRightLongitude', upperRightLongitude);
    }
    if (upperRightLatitude) {
      params = params.set('upperRightLatitude', upperRightLatitude);
    }

    const url = `${this.env.apiUrl}/device?${params.toString()}`;
    const devicePromise = this.http.get(url).toPromise();

    return await devicePromise as IDevice[];
  }

  public async getMyDevices(legalEntityId, pageIndex, pageSize) {
    let devices;
    if (legalEntityId) {
      let params = new HttpParams();
      params = params.set('pageSize', pageSize);
      params = params.set('pageIndex', pageIndex);
      params = params.set('legalEntityId', legalEntityId);

      const url = `${this.env.apiUrl}/device?${params.toString()}`;
      devices = await this.http.get(url).toPromise() as ISensor[];
    } else {
      devices = [];
    }

    return devices;
  }

  /** Update sensor details */
  public updateDetails(sensorId: string, details: IUpdateSensorBody) {
    return this.http.put(`${this.env.apiUrl}/sensor/${sensorId}/details`, details).toPromise();
  }

  /** Update location of a sensor */
  public updateLocation(sensorId: string, location: IUpdateLocationBody) {
    return this.http.put(`${this.env.apiUrl}/sensor/${sensorId}/location`, location).toPromise();
  }

  /** Activate a sensor */
  public activate(sensorId: string) {
    return this.http.put(`${this.env.apiUrl}/sensor/${sensorId}/activate`, {}).toPromise();
  }

  /** Deactivate a sensor */
  public deactivate(sensorId: string) {
    return this.http.put(`${this.env.apiUrl}/sensor/${sensorId}/deactivate`, {}).toPromise();
  }

  /** Add datastream to sensor */
  public addDatastream(sensorId: string, datastream: object) {
    return this.http.post(`${this.env.apiUrl}/sensor/${sensorId}/datastream`, datastream).toPromise();
  }

  /** Update datastream on sensor */
  public updateDatastream(sensorId: string, datastreamId: string, datastream: object) {
    return this.http.put(`${this.env.apiUrl}/sensor/${sensorId}/datastream/${datastreamId}`, datastream).toPromise();
  }

  /** Delete a datastream from sensor */
  public deleteDatastream(sensorId: string, datastreamId: string) {
    return this.http.delete(`${this.env.apiUrl}/sensor/${sensorId}/datastream/${datastreamId}`).toPromise();
  }

  /** Unregister a sensor */
  public unregister(id: string) {
    return this.http.delete(`${this.env.apiUrl}/device/${id}`).toPromise();
  }

  /** Retrieve a single device */
  public get(id: string) {
    return this.http.get(`${this.env.apiUrl}/device/${id}`);
  }
}
