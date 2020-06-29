import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { ISensor } from '../model/bodies/sensor-body';
import { SensorTheme } from '../model/bodies/sensorTheme';

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
  constructor(private http: HttpClient) { }

  /** Register sensor */
  public register(sensor: IRegisterSensorBody) {
    return this.http.post<ISensor>(`${environment.apiUrl}/Sensor`, sensor).toPromise();
  }

  /** Retrieve sensors */
  public getAll() {
    return this.http.get(`${environment.apiUrl}/Sensor`).toPromise();
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
    return this.http.post(`${environment.apiUrl}/Sensor/${sensorId}/create/datastream`, datastream).toPromise();
  }

  /** Delete a datastream from sensor */
  public deleteDatastream(sensorId: string, datastreamId: number) {
    return this.http.delete(`${environment.apiUrl}/Sensor/${sensorId}/delete/datastream/${datastreamId}`).toPromise();
  }

  /** Unregister a sensor */
  public unregister(id: number) {
    return this.http.delete(`${environment.apiUrl}/Sensor/${id}`).toPromise();
  }

  /** Retrieve a single sensor */
  public get(id: number) {
    return this.http.get(`${environment.apiUrl}/Sensor/${id}`).toPromise();
  }
}
