import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { IDevice } from '../model/bodies/device-model';
import { ISensor } from '../model/bodies/sensor-body';
import { EventType } from '../model/events/event-type';
import { ConnectionService } from './connection.service';
import { EnvService } from './env.service';

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
    location?: IUpdateLocationBody;
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

export interface IRegisterDatastreamBody {
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

export interface IUpdateDatastreamBody {
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

    constructor(private http: HttpClient, private env: EnvService, private connectionService: ConnectionService) {}

    public async subscribe() {
        // This way multiple calls to subscribe do not create new observables.
        if (!this.deviceLocated$ || !this.deviceUpdated$ || !this.deviceRemoved$) {
            const deviceUpdated$ = this.connectionService.subscribeTo(EventType.DeviceUpdated);
            const deviceRemoved$ = this.connectionService.subscribeTo(EventType.DeviceRemoved);
            const deviceLocated$ = this.connectionService.subscribeTo(EventType.DeviceLocated);
            const deviceRelocated$ = this.connectionService.subscribeTo(EventType.DeviceRelocated);
            const datastreamAdded$ = this.connectionService.subscribeTo(EventType.DatastreamAdded);
            const datastreamUpdated$ = this.connectionService.subscribeTo(EventType.DatastreamUpdated);
            const datastreamRemoved$ = this.connectionService.subscribeTo(EventType.DatastreamRemoved);

            this.deviceLocated$ = new Observable((observer: Subscriber<IDevice>) => {
                deviceLocated$.subscribe((sensor: IDevice) => {
                    observer.next(sensor);
                });
            });

            this.deviceUpdated$ = new Observable((observer: Subscriber<IDevice>) => {
                const updateFunction = (sensor: IDevice) => observer.next(sensor);

                deviceUpdated$.subscribe(updateFunction);
                deviceRelocated$.subscribe(updateFunction);
                datastreamAdded$.subscribe(updateFunction);
                datastreamUpdated$.subscribe(updateFunction);
                datastreamRemoved$.subscribe(updateFunction);
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

    public registerDatastream(deviceId: string, sensorId: string, datastream: IRegisterDatastreamBody) {
        return this.http.post(`${this.env.apiUrl}/device/${deviceId}/sensor/${sensorId}/datastream`, datastream);
    }

    public updateDatastream(
        deviceId: string,
        sensorId: string,
        datastreamId: string,
        datastream: IUpdateDatastreamBody,
    ) {
        return this.http.put(
            `${this.env.apiUrl}/device/${deviceId}/sensor/${sensorId}/datastream/${datastreamId}`,
            datastream,
        );
    }

    public removeDatastream(deviceId: string, sensorId: string, datastreamId: string) {
        return this.http.delete(`${this.env.apiUrl}/device/${deviceId}/sensor/${sensorId}/datastream/${datastreamId}`);
    }

    public async getDevices(
        bottomLeftLongitude?: string,
        bottomLeftLatitude?: string,
        upperRightLongitude?: string,
        upperRightLatitude?: string,
    ) {
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

        return (await devicePromise) as IDevice[];
    }

    public async getMyDevices(legalEntityId, pageIndex, pageSize, sortField, sortDirection, name?) {
        let devices;
        if (legalEntityId) {
            let params = new HttpParams();
            params = params.set('pageSize', pageSize);
            params = params.set('pageIndex', pageIndex);
            params = params.set('sortField', sortField);
            params = params.set('sortDirection', sortDirection);
            params = params.set('legalEntityId', legalEntityId);

            if (name) {
                params = params.set('name', name);
            }

            const url = `${this.env.apiUrl}/device?${params.toString()}`;
            devices = (await this.http.get(url).toPromise()) as ISensor[];
        } else {
            devices = [];
        }

        return devices;
    }

    /** Unregister a sensor */
    public unregister(id: string) {
        return this.http.delete(`${this.env.apiUrl}/device/${id}`).toPromise();
    }

    /** Retrieve a single device */
    public get(id: string) {
        return this.http.get(`${this.env.apiUrl}/device/${id}`);
    }

    public linkObservationGoal(deviceId: string, sensorId: string, datastreamId: string, observationGoalId: string) {
        const url = `${this.env.apiUrl}/device/${deviceId}/sensor/${sensorId}/datastream/${datastreamId}/linkgoal`;
        return this.http.put(url, { observationGoalId });
    }

    public unlinkObservationGoal(deviceId: string, sensorId: string, datastreamId: string, observationGoalId: string) {
        const url = `${this.env.apiUrl}/device/${deviceId}/sensor/${sensorId}/datastream/${datastreamId}/unlinkgoal`;
        return this.http.put(url, { observationGoalId });
    }
}
