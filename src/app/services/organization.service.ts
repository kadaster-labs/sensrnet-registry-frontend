import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Organization } from '../model/organization';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  constructor(private http: HttpClient) { }

  public register(organization: Organization) {
    return this.http.post(`${environment.apiUrl}/organization`, organization);
  }

  public get() {
    return this.http.get(`${environment.apiUrl}/organization`);
  }

  public getAll() {
    return this.http.get(`${environment.apiUrl}/organizations`);
  }

  public update(organization: Organization) {
    return this.http.put(`${environment.apiUrl}/organization`, organization);
  }

  public delete() {
    return this.http.delete(`${environment.apiUrl}/organization`);
  }
}
