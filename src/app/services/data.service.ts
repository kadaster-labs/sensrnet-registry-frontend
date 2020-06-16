import { Observable, Subscriber } from 'rxjs';
import * as io from 'socket.io-client';

export class DataService {
  private url = 'http://localhost:3000/sensor';
  private socket: SocketIOClient.Socket;

  constructor() { }

  public connect() {
    this.socket = io(this.url);

    this.socket.on('connect', (socket) => {
      console.log('Socket.io connected');
    });
  }

  public sendMessage(namespace: string = '/', ...args: any[]) {
    this.socket.emit(namespace, ...args);
  }

  public subscribeTo<T>(namespace: string = '/'): Observable<T> {
    return new Observable((observer: Subscriber<T>) => {
      this.socket.on(namespace, (message: T) => {
        observer.next(message);
      });
    });
  }
}
