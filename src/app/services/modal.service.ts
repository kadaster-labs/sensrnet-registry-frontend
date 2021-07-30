import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NavigationStart, Router } from '@angular/router';
import { ModalComponent } from '../components/modal/modal.component';

@Injectable({ providedIn: 'root' })
export class ModalService {

  public btnOkText = $localize`:@@modal.accept:OK`;
  public btnCancelText = $localize`:@@modal.decline:Cancel`;

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

  public async confirm(
    title: string,
    message: string,
    btnOkText: string = this.btnOkText,
    btnCancelText: string = this.btnCancelText,
    dialogSize: 'sm'|'lg' = 'sm'): Promise<any> {
    const modalRef = this.modalService.open(ModalComponent, { size: dialogSize, windowClass: 'modal-window' });
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.btnOkText = btnOkText;
    modalRef.componentInstance.btnCancelText = btnCancelText;

    return modalRef.result;
  }
}
