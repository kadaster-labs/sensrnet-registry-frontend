import { Component, OnDestroy, OnInit } from '@angular/core';
import { ILegalEntity } from '../../model/legalEntity';
import { LegalEntityService } from '../../services/legal-entity.service';

enum UpdateView {
    Join = 0,
    Create = 1,
}

enum OrganizationView {
    View = 0,
    Users = 1,
}

@Component({
    selector: 'app-organization',
    templateUrl: './organization.component.html',
})
export class OrganizationComponent implements OnInit, OnDestroy {
    public legalEntityId: string;
    public legalEntity: ILegalEntity;

    public subscriptions = [];

    public UpdateViewEnum = UpdateView;
    public OrganizationViewEnum = OrganizationView;

    public activeUpdateView = this.UpdateViewEnum.Join;
    public activeOrganizationView = this.OrganizationViewEnum.View;

    constructor(private legalEntityService: LegalEntityService) {}

    async getLegalEntity() {
        return await this.legalEntityService.get().toPromise();
    }

    setLegalEntity(legalEntity) {
        this.legalEntity = legalEntity;
    }

    async setLegalEntityId(legalEntityId: string) {
        this.legalEntityId = legalEntityId;

        if (!legalEntityId) {
            this.setLegalEntity(null);
        } else {
            this.setLegalEntity(await this.getLegalEntity());
        }
    }

    async ngOnInit(): Promise<void> {
        this.setLegalEntity(await this.getLegalEntity());

        const { onRegister, onUpdate, onRemove } = await this.legalEntityService.subscribe();

        this.subscriptions.push(
            onRegister.subscribe((legalEntity: ILegalEntity) => {
                if (this.legalEntityId === legalEntity._id) {
                    this.setLegalEntity(legalEntity);
                }
            }),
        );

        this.subscriptions.push(
            onUpdate.subscribe((legalEntity: ILegalEntity) => {
                this.setLegalEntity(legalEntity);
            }),
        );

        this.subscriptions.push(
            onRemove.subscribe((_) => {
                this.setLegalEntity(null);
            }),
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((x) => x.unsubscribe());
    }
}
