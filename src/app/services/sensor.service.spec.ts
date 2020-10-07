import { TestBed } from '@angular/core/testing';

import { SensorService } from './sensor.service';

describe('SensorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  xit('should be created', () => {
    const service: SensorService = TestBed.inject(SensorService);
    expect(service).toBeTruthy();
  });
});
