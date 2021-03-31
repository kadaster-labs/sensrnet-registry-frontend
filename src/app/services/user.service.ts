import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import { HttpClient } from '@angular/common/http';
import { UserUpdateBody } from '../model/bodies/user-update';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(
    private readonly http: HttpClient,
    private readonly env: EnvService,
    ) {}

  public retrieve() {
    return this.http.get(`${this.env.apiUrl}/user`);
  }

  public update(user: UserUpdateBody) {
    return this.http.put(`${this.env.apiUrl}/user`, user);
  }

  public updateById(userId: string, user: Record<string, any>) {
    return this.http.put(`${this.env.apiUrl}/user/${userId}`, user);
  }
}
