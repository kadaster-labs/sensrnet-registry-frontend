import { Component, OnInit } from '@angular/core';
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
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit {
  public legalEntity;

  public UpdateViewEnum = UpdateView;
  public OrganizationViewEnum = OrganizationView;

  public activeUpdateView = this.UpdateViewEnum.Join;
  public activeOrganizationView = this.OrganizationViewEnum.View;

  constructor(
    private legalEntityService: LegalEntityService,
  ) {}

  async getLegalEntity() {
    this.legalEntity = await this.legalEntityService.get().toPromise();
  }

  async ngOnInit(): Promise<void> {
    await this.getLegalEntity();
  }
}
