import { map } from 'rxjs/operators';
import { Owner } from '../model/owner';
import * as io from 'socket.io-client';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { EnvService } from './env.service';

@Injectable({ providedIn: 'root' })
export class ConnectionService {
  private socket: SocketIOClient.Socket;

  public currentOwner: Observable<Owner>;
  private currentOwnerSubject: BehaviorSubject<Owner>;

  constructor(
    private router: Router,
    private readonly http: HttpClient,
    private env: EnvService,
  ) {
    this.currentOwnerSubject = new BehaviorSubject<Owner>(JSON.parse(localStorage.getItem('currentOwner')));
    this.currentOwner = this.currentOwnerSubject.asObservable();
    this.connectSocket();
  }

  public get currentOwnerValue(): Owner {
    return this.currentOwnerSubject.value;
  }

  public login(username: string, password: string) {
    return this.http.post<any>(`${this.env.apiUrl}/auth/login`, { username, password })
      .pipe(map((data) => {

        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('currentOwner', JSON.stringify(data));
        this.currentOwnerSubject.next(data as Owner);

        // TODO: In early test phases we conceptually combined users and owners. This leads to the creation of both on
        // register, but only the user is returned. Therefore, an additional request is necessary for retrieving the
        // saved owner information. Ideally this would be separated.
        this.getOwner();
        this.connectSocket();

        return data;
      }));
  }

  public refreshAccessToken(): Observable<Owner> {
    return this.http.post<any>(`${this.env.apiUrl}/auth/refresh`, null)
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
    this.http.get<Owner>(`${this.env.apiUrl}/Owner/`)
      .subscribe((data: any) => {
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
    return this.http.put(`${this.env.apiUrl}/Owner/`, user)
      .pipe(map(() => {
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
      await this.http.post<void>(`${this.env.apiUrl}/auth/logout`, null).toPromise();
    } catch (error) {
      console.error('Something went wrong on logout', error);
    }
  }

  public connectSocket() {
    if (!this.socket) {
      const namespace = 'sensor';
      const host = this.env.apiUrl.substring(0, this.env.apiUrl.lastIndexOf('/'));  // strip the /api part

      const connectionOptions = {
        path: '/api/socket.io',
        transportOptions: undefined,
      };

      const currentOwner = this.currentOwnerValue;
      if (currentOwner) {
        connectionOptions.transportOptions = {
          polling: {
            extraHeaders: {
              Authorization: `Bearer ${currentOwner.access_token}`,
            }
          }
        };
      }

      const url = `${host}/${namespace}`;
      this.socket = io(url, connectionOptions);

      this.socket.on('connect', () => {
        console.log('Socket.io connected.');
      });

      this.socket.on('disconnect', async () => {
        console.log('Socket.io disconnected.');

        await this.disconnectSocket();
        await this.logout();
        await this.router.navigate(['/login']);
      });
    }
  }

  public async disconnectSocket() {
    if (this.socket) {
      await this.socket.close();
      this.socket = null;
    }
  }

  public subscribeTo<T>(namespace: string = '/'): Observable<T> {
    return new Observable((observer: Subscriber<T>) => {
      this.socket.on(namespace, (message: T) => observer.next(message));
    });
  }
}
