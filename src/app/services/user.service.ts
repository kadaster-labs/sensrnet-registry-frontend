import { User } from '../model/user';
import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import { HttpClient } from '@angular/common/http';
import { UserUpdateBody } from '../model/bodies/user-update';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(
    private http: HttpClient,
    private env: EnvService,
    ) {}

  public retrieve() {
    return this.http.get(`${this.env.apiUrl}/user`);
  }

  public register(user: User) {
    return this.http.post(`${this.env.apiUrl}/user`, user);
  }

  public update(user: UserUpdateBody) {
    return this.http.put(`${this.env.apiUrl}/user`, user);
  }

  public updateById(userId: string, user: Record<string, any>) {
    console.log(user);
    return this.http.put(`${this.env.apiUrl}/user/${userId}`, user);
  }
}
