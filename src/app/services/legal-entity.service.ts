import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { IContactDetails, ILegalEntity } from '../model/legalEntity';
import { EnvService } from './env.service';

export interface IRegisterLegalEntityBody {
  _id?: string;
  name: string;
  website?: string;
  contactDetails?: IContactDetails;
}

@Injectable({ providedIn: 'root' })
export class LegalEntityService {
  constructor(
    private env: EnvService,
    private http: HttpClient
  ) { }

  public register(legalEntity: IRegisterLegalEntityBody) {
    return this.http.post(`${this.env.apiUrl}/legalentity`, legalEntity);
  }

  public get() {
    return this.http.get<ILegalEntity>(`${this.env.apiUrl}/legalentity`);
  }

  public getLegalEntities(name?: string) {
    let params = new HttpParams();
    if (name) {
      params = params.set('name', name);
    }
    return this.http.get(`${this.env.apiUrl}/legalentities?${params.toString()}`);
  }

  public update(legalEntity: ILegalEntity) {
    return this.http.put(`${this.env.apiUrl}/legalentity`, legalEntity);
  }

  public updateContactDetails(contactDetailsId, contactDetails: IContactDetails) {
    return this.http.put(`${this.env.apiUrl}/legalentity/contactdetails/${contactDetailsId}`, contactDetails);
  }

  public delete() {
    return this.http.delete(`${this.env.apiUrl}/legalentity`);
  }
}
