import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NavigationStart, Router } from '@angular/router';
import { ModalComponent } from '../components/modal/modal.component';

@Injectable({ providedIn: 'root' })
export class ModalService {

  constructor(
    private router: Router,
    private modalService: NgbModal,
    ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.modalService.dismissAll('Route changed.');
      }
    });
  }

  public confirm(
    title: string,
    message: string,
    btnOkText: string = 'OK',
    btnCancelText: string = 'Cancel',
    dialogSize: 'sm'|'lg' = 'sm'): Promise<boolean> {
    const modalRef = this.modalService.open(ModalComponent, { size: dialogSize, windowClass: 'modal-window' });
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.btnOkText = btnOkText;
    modalRef.componentInstance.btnCancelText = btnCancelText;

    return modalRef.result;
  }
}
