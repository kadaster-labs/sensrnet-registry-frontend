import { Component, OnInit } from '@angular/core';
import { LegalEntityService } from '../../services/legal-entity.service';

enum UpdateView {
  Join = 0,
  Create = 1,
}

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit {
  public legalEntity;

  public UpdateViewEnum = UpdateView;
  public activeUpdateView = this.UpdateViewEnum.Join;

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
