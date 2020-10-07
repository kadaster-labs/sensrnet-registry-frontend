import { TestBed } from '@angular/core/testing';

import { ConnectionService } from './connection.service';

describe('AuthenticationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  xit('should be created', () => {
    const service: ConnectionService = TestBed.inject(ConnectionService);
    expect(service).toBeTruthy();
  });
});
