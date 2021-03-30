import { Claims } from '../model/claim';
import * as io from 'socket.io-client';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject, Observable, Subscriber } from 'rxjs';
import { OidcSecurityService } from 'angular-auth-oidc-client';

export class SocketEvent {
  constructor(
    public namespace?: string,
    public event?: any,
  ) {}
}

@Injectable({ providedIn: 'root' })
export class ConnectionService {
  private socket: SocketIOClient.Socket;

  private claimsSubject: BehaviorSubject<Claims> = new BehaviorSubject<Claims>(null);
  public claim$: Observable<Claims> = this.claimsSubject.asObservable();

  // Routing the events using a separate observable is necessary because a socket connection may not exist at the
  // time some component tries to subscribe to an endpoint.
  private eventReceiver: Subject<SocketEvent> = new Subject();
  private event$: Observable<SocketEvent> = this.eventReceiver.asObservable();
  private nameSpaceObservables: Record<string, Observable<any>> = {};

  constructor(
    private readonly router: Router,
    private readonly env: EnvService,
    private readonly http: HttpClient,
    private readonly oidcSecurityService: OidcSecurityService,
  ) {
    this.claim$.subscribe(claims => {
      if (!this.socket && claims && claims.organizationId) {
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
    this.claimsSubject.next(null);
  }

  public async refreshToken(): Promise<void> {
    const response = await this.http.get<any>(`${this.env.apiUrl}/user`).toPromise() as Claims;

    if (!response) {
      await this.logoutRedirect();
    } else {
      claim = await this.getClaimFromToken(response.accessToken);
      this.claimSubject.next(claim);
    }

    this.claimsSubject.next(response);
  }

  public async logout() {
    this.clearClaim();
    this.oidcSecurityService.logoffLocal();
  }

  public async logoutRedirect() {
    await this.disconnectSocket();
    await this.logout();
    await this.router.navigate(['/login']);
  }

  public connectSocket() {
    if (!this.socket) {
      const namespace = 'sensrnet';
      const host = this.env.apiUrl.substring(0, this.env.apiUrl.lastIndexOf('/'));  // strip the /api part

      const connectionOptions = {
        path: '/api/socket.io',
        transportOptions: undefined,
      };

      const token = this.oidcSecurityService.getIdToken();
      connectionOptions.transportOptions = {
        polling: {
          extraHeaders: {
            Authorization: `Bearer ${token}`,
          }
        }
      };

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

  public updateSocketLegalEntity(legalEntityId: string) {
    if (this.socket) {
      this.socket.emit('LegalEntityUpdated', {legalEntityId});
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
