import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Owner } from '../model/owner';
import { EnvService } from './env.service';

@Injectable({ providedIn: 'root' })
export class OwnerService {
  constructor(
    private env: EnvService,
    private http: HttpClient
  ) { }

  public register(user: Owner) {
    return this.http.post(`${this.env.apiUrl}/Owner`, user);
  }

  public update(user: Owner) {
    return this.http.put(`${this.env.apiUrl}/Owner/${user.id}`, user);
  }

  public delete(id: number) {
    return this.http.delete(`${this.env.apiUrl}/Owner/${id}`);
  }

  public get(id: number) {
    return this.http.get(`${this.env.apiUrl}/Owner/${id}`);
  }
}
