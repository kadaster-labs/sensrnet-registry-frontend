import { User } from '../model/user';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UserUpdateBody } from '../model/bodies/user-update';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(
    private http: HttpClient,
    ) {}

  public register(user: User) {
    return this.http.post(`${environment.apiUrl}/user`, user);
  }

  public update(user: UserUpdateBody) {
    return this.http.put(`${environment.apiUrl}/user`, user);
  }
}
