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

export interface IRegisterDeviceBody {
  _id?: string;
  name: string;
  description?: string;
  category?: string;
  connectivity?: string;
  location: IRegisterLocationBody;
}

export interface IDatastreamBody {
  name: string;

  reason?: string;
  description?: string;
  observedProperty?: string;
  unitOfMeasurement?: string;
  isPublic?: boolean;
  isOpenData?: boolean;
  isReusable?: boolean;
  documentationUrl?: string;
  dataLink?: string;
  dataFrequency?: number;
  dataQuality?: number;
}

export interface IRegisterSensorBody {
  category: string;
  typeName: string;
  location: number[];
  dataStreams: IDatastreamBody[];

  name?: string;
  aim?: string;
  baseObjectId?: string;
  description?: string;
  manufacturer?: string;
  active?: boolean;
  observationArea?: object;
  documentationUrl?: string;
  theme?: SensorTheme;
  typeDetails?: object;
}

export interface IRegisterSensorResponseBody {
  sensorId: string;
}

export interface IUpdateSensorBody {
  name?: string;
  aim?: string;
  description?: string;
  manufacturer?: string;
  observationArea?: object;
  documentationUrl?: string;
  theme?: SensorTheme[];
  category?: string;
  typeName?: string;
  typeDetails?: object;
}

export interface IUpdateLocationBody {
  location: number[];
  baseObjectId?: string;
}

export interface ITransferOwnershipBody {
  newOrganizationId: string;
}

export interface IShareOwnershipBody {
  organizationId: string;
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
      const deviceDeleted$ = this.connectionService.subscribeTo(EventType.DeviceDeleted);
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
        deviceDeleted$.subscribe((sensor: IDevice) => {
          observer.next(sensor);
        });
      });
    }

    return { onLocate: this.deviceLocated$, onUpdate: this.deviceUpdated$, onRemove: this.deviceRemoved$ };
  }

  /** Register device */
  public register(device: IRegisterDeviceBody) {
    return this.http.post(`${this.env.apiUrl}/device`, device).toPromise();
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

  public async getMySensors() {
    const claim = this.connectionService.currentClaim;

    let sensors;
    if (claim) {
      const params = new HttpParams();
      // params = params.set('organizationId', claim.organizationId);

      const url = `${this.env.apiUrl}/sensor?${params.toString()}`;
      const sensorPromise = this.http.get(url).toPromise();

      sensors = await sensorPromise as ISensor[];
    } else {
      sensors = [];
    }

    return sensors;
  }

  /** Update sensor details */
  public updateDetails(sensorId: string, details: IUpdateSensorBody) {
    return this.http.put(`${this.env.apiUrl}/sensor/${sensorId}/details`, details).toPromise();
  }

  /** Transfer sensor ownership */
  public transferOwnership(sensorId: string, body: ITransferOwnershipBody) {
    return this.http.put(`${this.env.apiUrl}/sensor/${sensorId}/transfer`, body).toPromise();
  }

  /** Share sensor ownership */
  public shareOwnership(sensorId: string, body: IShareOwnershipBody) {
    return this.http.put(`${this.env.apiUrl}/sensor/${sensorId}/share`, body).toPromise();
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
    return this.http.delete(`${this.env.apiUrl}/sensor/${id}`).toPromise();
  }

  /** Retrieve a single device */
  public get(id: string) {
    return this.http.get(`${this.env.apiUrl}/device/${id}`).toPromise();
  }
}
