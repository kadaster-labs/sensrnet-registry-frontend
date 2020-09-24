import {Observable, Subscriber} from 'rxjs';
import * as io from 'socket.io-client';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {AuthenticationService} from "./authentication.service";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private url = `${environment.apiUrl}`;
  private socket: SocketIOClient.Socket;

  private observables = {};

  constructor(
    private router: Router,
    private readonly http: HttpClient,
    private authenticationService: AuthenticationService
  ) {}

  public connect() {
    if (!this.socket) {
      // socket.io-client expects the url to be in the form of host/namespace. This doesn't work when the backend has the
      // globalPrefix /api/. In this case, the socket path has to be set manually. The uri needs to be in the form
      // host/namespace.
      const host = this.url.substring(0, this.url.lastIndexOf('/'));  // strip the /api part
      const namespace = 'sensor';
      const conn = `${host}/${namespace}`;

      const connectionOptions = {
        path: '/api/socket.io',
      };

      const currentOwner = this.authenticationService.currentOwnerValue;
      if (currentOwner) {
        connectionOptions['transportOptions'] = {
          polling: {
            extraHeaders: {
              Authorization: `Bearer ${currentOwner.access_token}`,
            }
          }
        }
      }

      this.socket = io(conn, connectionOptions);

      this.socket.on('connect', () => {
        console.log('Socket.io connected');
      });

      this.socket.on('disconnect', async () => {
        console.log('Socket.io disconnected.');

        this.disconnect();
        await this.authenticationService.logout();
        await this.router.navigate(['/login']);
      })
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.observables = {};
    }
  }

  public sendMessage(namespace: string = '/', ...args: any[]) {
    this.socket.emit(namespace, ...args);
  }

  public subscribeTo<T>(namespace: string = '/'): Observable<T> {
    if (!this.observables[namespace]) {
      this.observables[namespace] = new Observable((observer: Subscriber<T>) => {
        this.socket.on(namespace, (message: T) => observer.next(message));
      });
    }
    return this.observables[namespace];
  }

  public async getSensors() {
    return this.http.get(`${environment.apiUrl}/Sensor/`).toPromise();
  }
}
