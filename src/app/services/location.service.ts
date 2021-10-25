import { Injectable } from '@angular/core';
import GeometryType from 'ol/geom/GeometryType';
import { BehaviorSubject, Observable } from 'rxjs';
import { ISensorLocation } from '../model/bodies/location';

@Injectable({ providedIn: 'root' })
export class LocationService {
    private drawLocation: BehaviorSubject<GeometryType> = new BehaviorSubject(null);
    private drawGeometry: BehaviorSubject<Record<string, any>> = new BehaviorSubject(null);

    private locationMarker: BehaviorSubject<ISensorLocation> = new BehaviorSubject({
        type: 'Point',
        coordinates: [0, 0, 0],
    });

    private locationHighlight: BehaviorSubject<ISensorLocation> = new BehaviorSubject(null);

    drawLocation$: Observable<GeometryType> = this.drawLocation.asObservable();
    drawGeometry$: Observable<Record<string, any>> = this.drawGeometry.asObservable();

    showLocation$: Observable<ISensorLocation> = this.locationMarker.asObservable();
    locationHighlight$: Observable<ISensorLocation> = this.locationHighlight.asObservable();

    addDrawGeometry(geometry: Record<string, any>) {
        this.drawGeometry.next(geometry);
    }

    enableDraw(type: GeometryType): void {
        this.drawLocation.next(type);
    }

    disableDraw(): void {
        this.drawLocation.next(null);
    }

    showLocation(location: ISensorLocation) {
        this.locationMarker.next(location);
    }

    hideLocationMarker() {
        this.locationMarker.next(null);
    }

    highlightLocation(location: ISensorLocation) {
        this.locationHighlight.next(location);
    }

    hideLocationHighlight() {
        this.locationHighlight.next(null);
    }
}
