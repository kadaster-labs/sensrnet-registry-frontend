import { TestBed } from '@angular/core/testing';

import { OrganizationService } from './organization.service';

describe('UserService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  xit('should be created', () => {
    const service: OrganizationService = TestBed.inject(OrganizationService);
    expect(service).toBeTruthy();
  });
});
