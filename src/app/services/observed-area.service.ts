import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface IObservedAreaDTO {
    center?: number[];
    observedAreaRadii?: Array<Record<string, any>>;
    observedAreaPolygons?: Array<Record<string, any>>;
}

@Injectable({ providedIn: 'root' })
export class ObservedAreaService {
    private observedArea: BehaviorSubject<IObservedAreaDTO> = new BehaviorSubject(null);

    observedArea$: Observable<IObservedAreaDTO> = this.observedArea.asObservable();

    showObservedAreas(observedAreas: IObservedAreaDTO): void {
        this.observedArea.next(observedAreas);
    }

    hideObservedAreas(): void {
        this.observedArea.next(null);
    }
}
