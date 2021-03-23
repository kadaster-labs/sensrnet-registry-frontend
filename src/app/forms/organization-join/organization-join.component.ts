import { AlertService } from '../../services/alert.service';
import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import { LegalEntityService } from '../../services/legal-entity.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ILegalEntity } from '../../model/legalEntity';
import { UserService } from '../../services/user.service';
import { ConnectionService } from '../../services/connection.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import {UserUpdateBody} from '../../model/bodies/user-update';

@Component({
  selector: 'app-organization-join',
  templateUrl: './organization-join.component.html',
  styleUrls: ['./organization-join.component.scss']
})
export class OrganizationJoinComponent implements OnInit, OnDestroy {
  @Output() updateLegalEntity = new EventEmitter<boolean>();

  public form: FormGroup;
  public submitted = false;

  public subscriptions = [];
  public legalEntities = [];

  private filterChanged: Subject<string> = new Subject<string>();

  constructor(
    private alertService: AlertService,
    private readonly formBuilder: FormBuilder,
    private readonly userService: UserService,
    private readonly connectionService: ConnectionService,
    private readonly legalEntityService: LegalEntityService,
  ) {}

  get f() {
    return this.form.controls;
  }

  async getLegalEntities(name?: string) {
    const legalEntities = await this.legalEntityService.getLegalEntities(name).toPromise();
    if (legalEntities) {
      this.legalEntities = legalEntities as ILegalEntity[];
    } else {
      this.legalEntities = [];
    }
  }

  selectLegalEntity(legalEntityId: string) {
    if (legalEntityId === this.form.get('legalEntity').value) {
      this.form.patchValue({ legalEntity: '' });
    } else {
      this.form.patchValue({ legalEntity: legalEntityId });
    }
  }

  filterInputChanged(name) {
    this.filterChanged.next(name);
  }

  async ngOnInit(): Promise<void> {
    this.form = this.formBuilder.group({
      legalEntity: new FormControl('', Validators.required),
    });

    await this.getLegalEntities();
    this.subscriptions.push(this.filterChanged
      .pipe(debounceTime(750))
      .subscribe(name => this.getLegalEntities(name)));
  }

  public async submit() {
    this.submitted = true;
    if (this.form.valid) {
      try {
        const legalEntityId = this.form.value.legalEntity;
        const userUpdate: UserUpdateBody = {legalEntityId};
        await this.userService.update(userUpdate).toPromise();
        this.updateLegalEntity.emit();
        this.connectionService.updateSocketLegalEntity(legalEntityId);
      } catch (error) {
        this.alertService.error(error.message);
      }
    }
    this.submitted = false;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(x => x.unsubscribe());
  }
}
