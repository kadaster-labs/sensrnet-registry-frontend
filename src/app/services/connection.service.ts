import jwtDecode from 'jwt-decode';
import { map } from 'rxjs/operators';
import { Claim } from '../model/claim';
import * as io from 'socket.io-client';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject, Observable, Subscriber } from 'rxjs';

export class SocketEvent {
  constructor(
    public namespace?: string,
    public event?: any,
  ) {}
}

@Injectable({ providedIn: 'root' })
export class ConnectionService {
  private socket: SocketIOClient.Socket;

  private claimSubject: BehaviorSubject<Claim> = new BehaviorSubject<Claim>(null);
  public claim$: Observable<Claim> = this.claimSubject.asObservable();

  // Routing the events using a separate observable is necessary because a socket connection may not exist at the
  // time some component tries to subscribe to an endpoint.
  private eventReceiver: Subject<SocketEvent> = new Subject();
  private event$: Observable<SocketEvent> = this.eventReceiver.asObservable();
  private nameSpaceObservables: Record<string, Observable<any>> = {};

  constructor(
    private router: Router,
    private readonly http: HttpClient,
    private env: EnvService,
  ) {
    this.claim$.subscribe(claim => {
      if (!this.socket && claim && claim.accessToken) {
        this.connectSocket();
      }
    });
  }

  public getClaimFromToken(accessToken: string): Claim {
    let claim;
    if (accessToken) {
      try {
        const token = jwtDecode(accessToken) as any;
        claim = new Claim(token.sub, token.exp, accessToken);
      } catch {
        claim = new Claim();
      }
    } else {
      claim = new Claim();
    }

    return claim;
  }

  public get currentClaim(): Claim {
    return this.claimSubject.value;
  }

  public login(username: string, password: string) {
    return this.http.post<any>(`${this.env.apiUrl}/auth/login`, { username, password })
      .pipe(map((data) => {
        const claim = this.getClaimFromToken(data.accessToken);
        this.claimSubject.next(claim);

        return data;
      }));
  }

  public clearClaim() {
    this.claimSubject.next(null);
  }

  public async refreshClaim(): Promise<Claim> {
    const response = await this.http.post<any>(`${this.env.apiUrl}/auth/refresh`, null).toPromise();

    let claim;
    if (!response) {
      await this.logoutRedirect();
    } else {
      claim = await this.getClaimFromToken(response.accessToken);
      this.claimSubject.next(claim);
    }

    return claim;
  }

  public async logout() {
    this.clearClaim();

    try {
      await this.http.post<void>(`${this.env.apiUrl}/auth/logout`, null).toPromise();
    } catch (error) {
      console.error(`Something went wrong when logging out: ${error}.`);
    }
  }

  public async logoutRedirect() {
    await this.disconnectSocket();
    await this.logout();
    await this.router.navigate(['/login']);
  }

  public connectSocket() {
    if (!this.socket) {
      const namespace = 'device';
      const host = this.env.apiUrl.substring(0, this.env.apiUrl.lastIndexOf('/'));  // strip the /api part

      const connectionOptions = {
        path: '/api/socket.io',
        transportOptions: undefined,
      };

      const claim = this.currentClaim;
      if (claim && claim.accessToken) {
        connectionOptions.transportOptions = {
          polling: {
            extraHeaders: {
              Authorization: `Bearer ${claim.accessToken}`,
            }
          }
        };
      }

      const url = `${host}/${namespace}`;
      this.socket = io(url, connectionOptions);

      this.socket.on('connect', () => {
        console.log('Socket.io connected.');

        for (const ns of Object.keys(this.nameSpaceObservables)) {
          this.subscribeSocket(ns);
        }
      });

      this.socket.on('disconnect', async () => {
        console.log('Socket.io disconnected.');

        await this.logoutRedirect();
      });
    }
  }

  public async disconnectSocket() {
    if (this.socket) {
      await this.socket.close();
      this.socket = null;
    }
  }

  public subscribeSocket(namespace: string) {
    if (this.socket) {
      this.socket.on(namespace, (event) => {
        this.eventReceiver.next(new SocketEvent(namespace, event));
      });
    }
  }

  public subscribeTo<T>(namespace: string = '/'): Observable<T> {
    if (!this.nameSpaceObservables[namespace]) {
      this.nameSpaceObservables[namespace] = new Observable((observer: Subscriber<T>) => {
        this.event$.subscribe((event: SocketEvent) => {
          if (event.namespace === namespace) {
            observer.next(event.event);
          }
        });
      });

      this.subscribeSocket(namespace);
    }

    return this.nameSpaceObservables[namespace];
  }
}
