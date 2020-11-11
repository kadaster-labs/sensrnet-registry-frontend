import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Organization } from '../model/organization';
import { EnvService } from './env.service';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  constructor(
    private env: EnvService,
    private http: HttpClient
  ) { }

  public register(organization: Organization) {
    return this.http.post(`${this.env.apiUrl}/organization`, organization);
  }

  public get() {
    return this.http.get(`${this.env.apiUrl}/organization`);
  }

  public getOrganizations(website?: string) {
    let params = new HttpParams();
    if (website) {
      params = params.set('website', website);
    }
    return this.http.get(`${this.env.apiUrl}/organizations?${params.toString()}`);
  }

  public update(organization: Organization) {
    return this.http.put(`${this.env.apiUrl}/organization`, organization);
  }

  public delete() {
    return this.http.delete(`${this.env.apiUrl}/organization`);
  }
}
