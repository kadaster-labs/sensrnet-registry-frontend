import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Owner } from '../model/owner';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private currentOwnerSubject: BehaviorSubject<Owner>;
  public currentOwner: Observable<Owner>;

  constructor(private http: HttpClient) {
    this.currentOwnerSubject = new BehaviorSubject<Owner>(JSON.parse(localStorage.getItem('currentOwner')));
    this.currentOwner = this.currentOwnerSubject.asObservable();
  }

  public get currentOwnerValue(): Owner {
    return this.currentOwnerSubject.value;
  }

  public login(username, password) {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(map((data) => {
        const user: Owner = new Owner(
          data.id,
          data.email,
          data.password,
          data.name,
          data.organization,
          data.phone,
          data.website,
          data.access_token,
        );

        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('currentOwner', JSON.stringify(user));
        this.currentOwnerSubject.next(user);
        return user;
      }));
  }

  public logout() {
    // remove user from local storage and set current user to null
    localStorage.removeItem('currentOwner');
    this.currentOwnerSubject.next(null);
  }
}
