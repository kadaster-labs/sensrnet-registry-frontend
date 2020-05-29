import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

export class DataService {
    private url: string = 'http://localhost:3000/sensor';
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

    public subscribeTo(namespace='/'): Observable<any> {
        return Observable.create((observer) => {
            this.socket.on(namespace, (message) => {
                observer.next(message);
            });
        })
    }
}