import { Observable, Subscriber } from 'rxjs';
import * as io from 'socket.io-client';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Owner} from "../model/owner";

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private url = `${environment.apiUrl}`;
  private socket: SocketIOClient.Socket;

  private observables = {};

  constructor(
    private readonly http: HttpClient,
  ) {
    this.connect();
  }

  public connect() {
    // socket.io-client expects the url to be in the form of host/namespace. This doesn't work when the backend has the
    // globalPrefix /api/. In this case, the socket path has to be set manually. The uri needs to be in the form
    // host/namespace.
    const host = this.url.substring(0, this.url.lastIndexOf('/'));  // strip the /api part
    const namespace = 'sensor';
    const conn = `${host}/${namespace}`;

    this.socket = io(conn, {
      path: '/api/socket.io',
    });

    this.socket.on('connect', () => {
      console.log('Socket.io connected');
    });
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
