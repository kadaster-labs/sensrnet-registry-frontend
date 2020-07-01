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

        // TODO: In early test phases we conceptually combined users and owners. This leads to the creation of both on
        // register, but only the user is returned. Therefore, an additional request is necessary for retrieving the
        // saved owner information. Ideally this would be seperated.
        this.getOwner()
        .subscribe((ownerData: Owner) => {
          let owner: Owner = JSON.parse(localStorage.getItem('currentOwner'));

          const partialUser = {
            id: ownerData[0]._id,
            email: ownerData[0].contactEmail,
            name: ownerData[0].name,
            phone: ownerData[0].contactPhone,
            website: ownerData[0].website,
          };

          owner = {...owner, ...partialUser};

          localStorage.setItem('currentOwner', JSON.stringify(owner));
          this.currentOwnerSubject.next(owner);
          return user;
        });
      }));
  }

  // TODO: getOwner and updateOwner function are duplicated here from ownerService. This class should only concern the
  // authentication of a user. Therefore, these functions should return to ownerService.
  public getOwner() {
    return this.http.get<Owner>(`${environment.apiUrl}/Owner/`);
  }

  public updateOwner(user: Owner) {
    return this.http.put(`${environment.apiUrl}/Owner/`, user)
    .pipe(map((data) => {
      let owner: Owner = JSON.parse(localStorage.getItem('currentOwner'));

      owner = {...owner, ...user};

      localStorage.setItem('currentOwner', JSON.stringify(owner));
      this.currentOwnerSubject.next(owner);
      return user;
    }));
  }

  public logout() {
    // remove user from local storage and set current user to null
    localStorage.removeItem('currentOwner');
    this.currentOwnerSubject.next(null);
  }
}
