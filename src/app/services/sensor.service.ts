import {Injectable} from '@angular/core';
import {Observable, Subscriber} from 'rxjs';
import {ISensor} from '../model/bodies/sensor-body';
import {SensorTheme} from '../model/bodies/sensorTheme';
import {environment} from '../../environments/environment';
import {ConnectionService} from './connection.service';
import {EventType} from '../model/events/event-type';
import {HttpClient, HttpParams} from '@angular/common/http';

export interface ILocationBody {
  longitude: number;
  latitude: number;
  height: number;
  baseObjectId: string;
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
  typeName: string;
  location: ILocationBody;
  dataStreams: IDatastreamBody[];

  name?: string;
  aim?: string;
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
  typeName?: string;
  typeDetails?: object;
}

export interface ITransferOwnershipBody {
  newOwnerId: string;
}

export interface IShareOwnershipBody {
  ownerIds: string[];
}

@Injectable({ providedIn: 'root' })
export class SensorService {

  private sensorCreated$: Observable<ISensor>;
  private sensorUpdated$: Observable<ISensor>;
  private sensorDeleted$: Observable<ISensor>;

  constructor(
    private http: HttpClient,
    private connectionService: ConnectionService,
  ) {}

  public async subscribe() {
    if (!this.sensorCreated$ || !this.sensorUpdated$ || !this.sensorDeleted$) {
      const sensorDeleted$ = this.connectionService.subscribeTo(EventType.SensorDeleted);
      const sensorUpdated$ = this.connectionService.subscribeTo(EventType.SensorUpdated);
      const sensorRegistered$ = this.connectionService.subscribeTo(EventType.SensorRegistered);
      const sensorActivated$ = await this.connectionService.subscribeTo(EventType.SensorActivated);
      const sensorDeactivated$ = await this.connectionService.subscribeTo(EventType.SensorDeactivated);
      const sensorLocationUpdated$ = await this.connectionService.subscribeTo(EventType.SensorRelocated);

      this.sensorCreated$ = new Observable((observer: Subscriber<ISensor>) => {
        sensorRegistered$.subscribe((sensor: ISensor) => {
          observer.next(sensor);
        });
      });

      this.sensorUpdated$ = new Observable((observer: Subscriber<ISensor>) => {
        const updateFunction = (sensor: ISensor) => {
          observer.next(sensor);
        };
        sensorUpdated$.subscribe(updateFunction);
        sensorActivated$.subscribe(updateFunction);
        sensorDeactivated$.subscribe(updateFunction);
        sensorLocationUpdated$.subscribe(updateFunction);
      });

      this.sensorDeleted$ = new Observable((observer: Subscriber<ISensor>) => {
        sensorDeleted$.subscribe((sensor: ISensor) => {
          observer.next(sensor);
        });
      });
    }

    return {onRegister: this.sensorCreated$, onUpdate: this.sensorUpdated$, onDelete: this.sensorDeleted$};
  }

  /** Register sensor */
  public register(sensor: IRegisterSensorBody) {
    return this.http.post<IRegisterSensorResponseBody>(`${environment.apiUrl}/Sensor`, sensor).toPromise();
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

    const url = `${environment.apiUrl}/Sensor?${params.toString()}`;
    const sensorPromise = this.http.get(url).toPromise();
    return await sensorPromise as ISensor[];
  }

  public async getMySensors() {
    const owner = this.connectionService.currentOwnerValue;

    let params = new HttpParams();
    params = params.set('ownerId', owner.id);

    const url = `${environment.apiUrl}/Sensor?${params.toString()}`;
    const sensorPromise = this.http.get(url).toPromise();
    return await sensorPromise as ISensor[];
  }

  /** Update sensor details */
  public updateDetails(sensorId: string, details: IUpdateSensorBody) {
    return this.http.put(`${environment.apiUrl}/Sensor/${sensorId}/details`, details).toPromise();
  }

  /** Transfer sensor ownership */
  public transferOwnership(sensorId: string, body: ITransferOwnershipBody) {
    return this.http.put(`${environment.apiUrl}/Sensor/${sensorId}/transfer`, body).toPromise();
  }

  /** Share sensor ownership */
  public shareOwnership(sensorId: string, body: IShareOwnershipBody) {
    return this.http.put(`${environment.apiUrl}/Sensor/${sensorId}/share`, body).toPromise();
  }

  /** Update location of a sensor */
  public updateLocation(sensorId: string, location: ILocationBody) {
    return this.http.put(`${environment.apiUrl}/Sensor/${sensorId}/location`, location).toPromise();
  }

  /** Activate a sensor */
  public activate(sensorId: string) {
    return this.http.put(`${environment.apiUrl}/Sensor/${sensorId}/activate`, {}).toPromise();
  }

  /** Deactivate a sensor */
  public deactivate(sensorId: string) {
    return this.http.put(`${environment.apiUrl}/Sensor/${sensorId}/deactivate`, {}).toPromise();
  }

  /** Add datastream to sensor */
  public addDatastream(sensorId: string, datastream: object) {
    return this.http.post(`${environment.apiUrl}/Sensor/${sensorId}/datastream`, datastream).toPromise();
  }

  /** Update datastream on sensor */
  public updateDatastream(sensorId: string, datastreamId: string, datastream: object) {
    return this.http.put(`${environment.apiUrl}/Sensor/${sensorId}/datastream/${datastreamId}`, datastream).toPromise();
  }

  /** Delete a datastream from sensor */
  public deleteDatastream(sensorId: string, datastreamId: string) {
    return this.http.delete(`${environment.apiUrl}/Sensor/${sensorId}/datastream/${datastreamId}`).toPromise();
  }

  /** Unregister a sensor */
  public unregister(id: string) {
    return this.http.delete(`${environment.apiUrl}/Sensor/${id}`).toPromise();
  }

  /** Retrieve a single sensor */
  public get(id: string) {
    return this.http.get(`${environment.apiUrl}/Sensor/${id}`).toPromise();
  }
}
