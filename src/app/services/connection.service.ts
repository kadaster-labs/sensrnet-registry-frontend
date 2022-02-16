import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { BehaviorSubject, Subject, Observable, Subscriber } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { ILegalEntity } from '../model/legalEntity';
import { EnvService } from './env.service';

export class SocketEvent {
    constructor(public namespace?: string, public event?: any) {}
}

@Injectable({ providedIn: 'root' })
export class ConnectionService {
    private socket: Socket;

    private legalEntitySubject: BehaviorSubject<ILegalEntity> = new BehaviorSubject<ILegalEntity>(null);
    public legalEntity$: Observable<ILegalEntity> = this.legalEntitySubject.asObservable();

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
        this.legalEntity$.subscribe((legalEntity) => {
            if (!this.socket && legalEntity) {
                this.connectSocket();
            }
        });
    }

    public get currentLegalEntity(): ILegalEntity {
        return this.legalEntitySubject.value;
    }

    public clearLegalEntity() {
        this.legalEntitySubject.next(null);
    }

    public async refreshLegalEntity(): Promise<void> {
        let response;
        try {
            response = (await this.http.get<any>(`${this.env.apiUrl}/legalentity`).toPromise()) as ILegalEntity;
        } catch {
            return this.logoutRedirect();
        }

        if (response) {
            this.legalEntitySubject.next(response);
        }
    }

    public async logout() {
        this.clearLegalEntity();
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
            const host = this.env.apiUrl.substring(0, this.env.apiUrl.lastIndexOf('/')); // strip the /api part

            const connectionOptions = {
                path: '/api/socket.io',
                transportOptions: undefined,
            };

            const token = this.oidcSecurityService.getIdToken();
            connectionOptions.transportOptions = {
                polling: {
                    extraHeaders: {
                        Authorization: `Bearer ${token}`,
                    },
                },
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
            this.socket.emit('LegalEntityUpdated', { legalEntityId });
        }
    }

    public subscribeSocket(namespace: string) {
        if (this.socket) {
            this.socket.on(namespace, (event) => {
                this.eventReceiver.next(new SocketEvent(namespace, event));
            });
        }
    }

    public subscribeTo<T>(namespace = '/'): Observable<T> {
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
