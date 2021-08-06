import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app--confirmation-modal',
    templateUrl: './confirmation-modal.html',
})
export class ConfirmationModalComponent {
    @Input() title: string;
    @Input() message: string;
    @Input() btnOkText: string;
    @Input() btnCancelText: string;

    constructor(private activeModal: NgbActiveModal) {}

    public decline() {
        this.activeModal.dismiss();
    }

    public accept() {
        this.activeModal.close();
    }

    public dismiss() {
        this.activeModal.dismiss();
    }
}
