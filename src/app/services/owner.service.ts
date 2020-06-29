import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Owner } from '../model/owner';

@Injectable({ providedIn: 'root' })
export class OwnerService {
  constructor(private http: HttpClient) { }

  public register(user: Owner) {
    return this.http.post(`${environment.apiUrl}/Owner`, user);
  }

  public update(user: Owner) {
    return this.http.put(`${environment.apiUrl}/Owner/${user.id}`, user);
  }

  public delete(id: number) {
    return this.http.delete(`${environment.apiUrl}/Owner/${id}`);
  }

  public get(id: number) {
    return this.http.get(`${environment.apiUrl}/Owner/${id}`);
  }
}
