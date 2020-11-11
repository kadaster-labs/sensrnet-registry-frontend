import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

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

  public getOrganizations(website?: string) {
    let params = new HttpParams();
    if (website) {
      params = params.set('website', website);
    }
    return this.http.get(`${environment.apiUrl}/organizations?${params.toString()}`);
  }

  public update(organization: Organization) {
    return this.http.put(`${environment.apiUrl}/organization`, organization);
  }

  public delete() {
    return this.http.delete(`${environment.apiUrl}/organization`);
  }
}
