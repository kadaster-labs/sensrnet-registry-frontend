import { User } from '../model/user';
import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import { HttpClient } from '@angular/common/http';
import { UserUpdateBody } from '../model/bodies/user-update';
import { ConnectionService } from './connection.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(
    private readonly http: HttpClient,
    private readonly env: EnvService,
    private readonly connectionService: ConnectionService,
    ) {}

  public update(user: UserUpdateBody) {
    return this.http.put(`${this.env.apiUrl}/user`, user);
  }

  public hasJoinedOrganization(): boolean {
    const claim = this.connectionService.currentClaims;
    return !!(claim && claim.organizationId);
  }
}
