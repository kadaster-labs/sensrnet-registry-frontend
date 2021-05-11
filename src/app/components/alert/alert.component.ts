import { Subscription } from 'rxjs';
import { AlertService } from '../../services/alert.service';
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit, OnDestroy {
  public message: any;
  private subscription: Subscription;

  constructor(
    private alertService: AlertService,
    ) {}

  public ngOnInit() {
    this.subscription = this.alertService.getAlert()
      .subscribe((message) => {
        switch (message && message.type) {
          case 'success':
            message.cssClass = 'alert alert-success';
            break;
          case 'warning':
            message.cssClass = 'alert alert-warning';
            break;
          case 'error':
            message.cssClass = 'alert alert-danger';
            break;
        }

        this.message = message;
      });
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
