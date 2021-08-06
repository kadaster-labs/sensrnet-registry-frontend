import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { urlRegex } from '../../helpers/form.helpers';
import { UserUpdateBody } from '../../model/bodies/user-update';
import { IContactDetails, ILegalEntity } from '../../model/legalEntity';
import { AlertService } from '../../services/alert.service';
import { ConnectionService } from '../../services/connection.service';
import { LegalEntityService } from '../../services/legal-entity.service';
import { ModalService } from '../../services/modal.service';
import { UserService } from '../../services/user.service';
import { createOrganizationMailValidator } from '../../validators/organization-mail.validator';

@Component({
    selector: 'app-organization-update',
    templateUrl: './organization-update.component.html',
})
export class OrganizationUpdateComponent implements OnInit {
    @Input() public legalEntity: ILegalEntity;
    @Output() setLegalEntityId = new EventEmitter<string>();

    public form: FormGroup;
    public submitted = false;

    public updateSuccessMessage = $localize`:@@organization.update:Updated the organization.`;

    public leaveOrgConfirmTitleString = $localize`:@@leave.organization.confirm.title:Leave Organization`;
    public leaveOrgConfirmBodyString = $localize`:@@leave.organization.confirm.body:You are about to leave your organization. Are you sure?`;

    public removeOrgConfirmTitleString = $localize`:@@remove.organization.confirm.title:Remove Organization`;
    public removeOrgConfirmBodyString = $localize`:@@remove.organization.confirm.body:You are about to remove your organization. First all devices need to be removed before this will succeed. Are you sure to continue now?`;

    constructor(
        private readonly formBuilder: FormBuilder,
        private readonly userService: UserService,
        private readonly alertService: AlertService,
        private readonly connectionService: ConnectionService,
        private readonly legalEntityService: LegalEntityService,
        private readonly modalService: ModalService,
    ) {}

    get f() {
        return this.form.controls;
    }

    ngOnInit(): void {
        let contactName;
        let contactPhone;
        let contactEmail;
        if (this.legalEntity && this.legalEntity.contactDetails && this.legalEntity.contactDetails.length) {
            if (this.legalEntity.contactDetails[0].name) {
                contactName = this.legalEntity.contactDetails[0].name;
            }
            if (this.legalEntity.contactDetails[0].phone) {
                contactPhone = this.legalEntity.contactDetails[0].phone;
            }
            if (this.legalEntity.contactDetails[0].email) {
                contactEmail = this.legalEntity.contactDetails[0].email;
            }
        }

        this.form = this.formBuilder.group({
            name: [this.legalEntity ? this.legalEntity.name : null, [Validators.required]],
            website: [this.legalEntity ? this.legalEntity.website : null, [Validators.pattern(urlRegex)]],
            contactName: [contactName],
            contactPhone: [contactPhone],
            contactEmail: [contactEmail, [createOrganizationMailValidator()]],
        });
    }

    public async leave() {
        await this.modalService.confirm(this.leaveOrgConfirmTitleString, this.leaveOrgConfirmBodyString).then(
            async () => {
                const userUpdate: UserUpdateBody = {
                    leaveLegalEntity: true,
                };
                try {
                    await this.userService.update(userUpdate).toPromise();

                    this.setLegalEntityId.emit(null);
                    this.connectionService.updateSocketLegalEntity(null);
                } catch (e) {
                    this.alertService.error(e.error.message);
                }
            },
            () => {},
        );
    }

    public async remove() {
        await this.modalService.confirm(this.removeOrgConfirmTitleString, this.removeOrgConfirmBodyString).then(
            async () => {
                try {
                    await this.legalEntityService.delete().toPromise();
                    this.alertService.success('Successfully removed your organization!');

                    this.connectionService.updateSocketLegalEntity(null);
                    this.setLegalEntityId.emit(null);
                } catch (e) {
                    this.alertService.error(e.error.message);
                }
            },
            () => {},
        );
    }

    public async submit() {
        this.submitted = true;
        if (!this.form.invalid) {
            const legalEntityUpdate: Record<string, any> = {};
            if (this.form.controls.name.dirty) {
                legalEntityUpdate.name = this.form.value.name;
            }
            if (this.form.controls.website.dirty) {
                legalEntityUpdate.website = this.form.value.website;
            }

            const contactDetailsUpdate: Record<string, any> = {};
            if (this.form.controls.contactName.dirty) {
                contactDetailsUpdate.name = this.form.value.contactName;
            }
            if (this.form.controls.contactPhone.dirty) {
                contactDetailsUpdate.phone = this.form.value.contactPhone;
            }
            if (this.form.controls.contactEmail.dirty) {
                contactDetailsUpdate.email = this.form.value.contactEmail;
            }

            try {
                if (Object.keys(legalEntityUpdate).length) {
                    await this.legalEntityService.update(legalEntityUpdate as ILegalEntity).toPromise();
                }
                if (Object.keys(contactDetailsUpdate).length) {
                    let contactDetailsId;
                    if (this.legalEntity && this.legalEntity.contactDetails && this.legalEntity.contactDetails.length) {
                        contactDetailsId = this.legalEntity.contactDetails[0]._id;
                        await this.legalEntityService
                            .updateContactDetails(contactDetailsId, contactDetailsUpdate as IContactDetails)
                            .toPromise();
                    }
                }

                this.alertService.success(this.updateSuccessMessage);
            } catch (e) {
                this.alertService.error(e.error.message);
            }
            this.submitted = false;
        }
    }
}
