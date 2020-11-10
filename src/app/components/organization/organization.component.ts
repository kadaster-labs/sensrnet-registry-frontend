import { Claim } from '../../model/claim';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConnectionService } from '../../services/connection.service';

enum UpdateView {
  Join = 0,
  Create = 1,
}

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit, OnDestroy {
  public subscriptions = [];
  public belongsToOrganization = false;

  public UpdateViewEnum = UpdateView;
  public activeUpdateView = this.UpdateViewEnum.Join;

  constructor(
    private readonly connectionService: ConnectionService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(this.connectionService.claim$.subscribe(async (claim: Claim) => {
      this.belongsToOrganization = !!(claim && claim.organizationId);
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
