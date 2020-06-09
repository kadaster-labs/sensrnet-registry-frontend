import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { Owner } from '../model/owner';

@Injectable({ providedIn: 'root' })
export class OwnerService {
  constructor(private http: HttpClient) { }

  public register(user: Owner) {
    return this.http.post(`${environment.apiUrl}/user`, user);
  }

  public delete(id: number) {
    return this.http.delete(`${environment.apiUrl}/users/${id}`);
  }
}
