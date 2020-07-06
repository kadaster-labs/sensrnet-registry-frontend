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

  constructor(
    private readonly http: HttpClient,
  ) {
    this.currentOwnerSubject = new BehaviorSubject<Owner>(JSON.parse(localStorage.getItem('currentOwner')));
    this.currentOwner = this.currentOwnerSubject.asObservable();
  }

  public get currentOwnerValue(): Owner {
    return this.currentOwnerSubject.value;
  }

  public login(username, password) {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(map((data) => {

        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('currentOwner', JSON.stringify(data));
        this.currentOwnerSubject.next(data as Owner);

        // TODO: In early test phases we conceptually combined users and owners. This leads to the creation of both on
        // register, but only the user is returned. Therefore, an additional request is necessary for retrieving the
        // saved owner information. Ideally this would be seperated.
        this.getOwner();

        return data;
      }));
  }

  public refreshAccessToken(): Observable<Owner> {
    return this.http.post<any>(`${environment.apiUrl}/auth/refresh`, null)
      .pipe(map((data) => {

        const user: Owner = { ...this.currentOwnerValue, ...data };

        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('currentOwner', JSON.stringify(user));
        this.currentOwnerSubject.next(user);

        return user;
      }));
  }

  // TODO: getOwner and updateOwner function are duplicated here from ownerService. This class should only concern the
  // authentication of a user. Therefore, these functions should return to ownerService.
  public getOwner(): void {
    console.log('getOwner');
    this.http.get<Owner>(`${environment.apiUrl}/Owner/`)
      .subscribe((data) => {
        let owner: Owner = JSON.parse(localStorage.getItem('currentOwner'));

        const partialUser = {
          id: data[0]._id,
          name: data[0].name,
          contactEmail: data[0].contactEmail,
          contactPhone: data[0].contactPhone,
          organisationName: data[0].organisationName,
          website: data[0].website,
        };

        owner = { ...owner, ...partialUser };

        console.log('got new owner', owner);

        localStorage.setItem('currentOwner', JSON.stringify(owner));
        this.currentOwnerSubject.next(owner);

        return owner;
      });
  }

  public updateOwner(user: Owner): Observable<Owner> {
    return this.http.put(`${environment.apiUrl}/Owner/`, user)
      .pipe(map((data) => {
        let owner: Owner = JSON.parse(localStorage.getItem('currentOwner'));

        owner = { ...owner, ...user };

        localStorage.setItem('currentOwner', JSON.stringify(owner));
        this.currentOwnerSubject.next(owner);
        return user;
      }));
  }

  public async logout() {
    localStorage.removeItem('currentOwner');
    this.currentOwnerSubject.next(null);
    try {
      await this.http.post<void>(`${environment.apiUrl}/auth/logout`, null).toPromise();
    } catch (error) {
      console.error('Something went wrong on logout', error);
    }
  }
}
