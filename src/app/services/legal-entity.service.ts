import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IContactDetails, ILegalEntity } from '../model/legalEntity';
import { Observable, Subscriber } from 'rxjs';
import { EventType } from '../model/events/event-type';
import { ConnectionService } from './connection.service';

export interface IRegisterLegalEntityBody {
  _id?: string;
  name: string;
  website?: string;
  contactDetails?: IContactDetails;
}

@Injectable({ providedIn: 'root' })
export class LegalEntityService {
  private legalEntityUpdated$: Observable<ILegalEntity>;
  private legalEntityRemoved$: Observable<ILegalEntity>;
  private legalEntityRegistered$: Observable<ILegalEntity>;

  constructor(
    private env: EnvService,
    private http: HttpClient,
    private connectionService: ConnectionService,
  ) {}

  public async subscribe() {
    // This way multiple calls to subscribe do not create new observables.
    if (!this.legalEntityUpdated$ || !this.legalEntityRemoved$ || !this.legalEntityRegistered$) {
      const legalEntityUpdated$ = this.connectionService.subscribeTo(EventType.OrganizationUpdated);
      const publicContactDetailsAdded$ = this.connectionService.subscribeTo(EventType.PublicContactDetailsAdded);
      const contactDetailsUpdated$ = this.connectionService.subscribeTo(EventType.ContactDetailsUpdated);
      const contactDetailsRemoved$ = this.connectionService.subscribeTo(EventType.ContactDetailsRemoved);
      const legalEntityRemoved$ = this.connectionService.subscribeTo(EventType.LegalEntityRemoved);
      const legalEntityRegistered$ = this.connectionService.subscribeTo(EventType.OrganizationRegistered);

      this.legalEntityUpdated$ = new Observable((observer: Subscriber<ILegalEntity>) => {
        const updateFn = (legalEntity: ILegalEntity) => observer.next(legalEntity);
        legalEntityUpdated$.subscribe(updateFn);
        publicContactDetailsAdded$.subscribe(updateFn);
        contactDetailsUpdated$.subscribe(updateFn);
        contactDetailsRemoved$.subscribe(updateFn);
      });

      this.legalEntityRemoved$ = new Observable((observer: Subscriber<ILegalEntity>) => {
        legalEntityRemoved$.subscribe((legalEntity: ILegalEntity) => observer.next(legalEntity));
      });

      this.legalEntityRegistered$ = new Observable((observer: Subscriber<ILegalEntity>) => {
        legalEntityRegistered$.subscribe((legalEntity: ILegalEntity) => observer.next(legalEntity));
      });
    }

    return { onRegister: this.legalEntityRegistered$, onUpdate: this.legalEntityUpdated$, onRemove: this.legalEntityRemoved$ };
  }

  public register(legalEntity: IRegisterLegalEntityBody) {
    return this.http.post(`${this.env.apiUrl}/legalentity/organization`, legalEntity);
  }

  public get() {
    return this.http.get<ILegalEntity>(`${this.env.apiUrl}/legalentity`);
  }

  public getLegalEntities(name?: string) {
    let params = new HttpParams();
    if (name) {
      params = params.set('name', name);
    }
    return this.http.get(`${this.env.apiUrl}/legalentities?${params.toString()}`);
  }

  public update(legalEntity: ILegalEntity) {
    return this.http.put(`${this.env.apiUrl}/legalentity/organization`, legalEntity);
  }

  public updateContactDetails(contactDetailsId, contactDetails: IContactDetails) {
    return this.http.put(`${this.env.apiUrl}/legalentity/contactdetails/${contactDetailsId}`, contactDetails);
  }

  public delete() {
    return this.http.delete(`${this.env.apiUrl}/legalentity`);
  }
}
