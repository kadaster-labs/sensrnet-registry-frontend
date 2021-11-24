import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IDevice } from '../model/bodies/device-model';

@Injectable({ providedIn: 'root' })
export class LocationService {
    private observedArea: BehaviorSubject<IDevice> = new BehaviorSubject(null);

    observedArea$: Observable<IDevice> = this.observedArea.asObservable();

    showObservedArea(device: IDevice): void {
        this.observedArea.next(device);
    }

    disableDraw(): void {
        this.observedArea.next(null);
    }
}
