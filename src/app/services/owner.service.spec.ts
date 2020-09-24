import { TestBed } from '@angular/core/testing';

import { OwnerService } from './owner.service';

describe('UserService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  xit('should be created', () => {
    const service: OwnerService = TestBed.inject(OwnerService);
    expect(service).toBeTruthy();
  });
});
