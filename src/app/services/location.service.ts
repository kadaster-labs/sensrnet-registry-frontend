import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ISensorLocation } from '../model/bodies/location';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private location: BehaviorSubject<ISensorLocation> = new BehaviorSubject({
    type: 'Point',
    coordinates: [0, 0, 0],
    baseObjectId: 'non-empty',
  });

  private locationMarker: BehaviorSubject<ISensorLocation> = new BehaviorSubject({
    type: 'Point',
    coordinates: [0, 0, 0],
    baseObjectId: 'non-empty',
  });

  private locationHighlight: BehaviorSubject<ISensorLocation> = new BehaviorSubject(null);

  location$: Observable<ISensorLocation> = this.location.asObservable();
  showLocation$: Observable<ISensorLocation> = this.locationMarker.asObservable();
  locationHighlight$: Observable<ISensorLocation> = this.locationHighlight.asObservable();

  setLocation(location: ISensorLocation) {
    let currentLocation = this.location.getValue();
    currentLocation = location;
    this.location.next(location);
  }

  unsetLocation() {
    let location = this.location.getValue();
    location = undefined;
    this.location.next(location);
  }

  showLocation(location: ISensorLocation) {
    let currentLocation = this.locationMarker.getValue();
    currentLocation = location;
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
