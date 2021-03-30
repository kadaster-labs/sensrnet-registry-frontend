import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AlertService } from '../../services/alert.service';
import { ConnectionService } from '../../services/connection.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-organization-users',
  templateUrl: './organization-users.component.html',
  styleUrls: ['./organization-users.component.scss']
})
export class OrganizationUsersComponent implements OnInit {
  public form: FormGroup;
  public submitted = false;

  public noUsersSelectedMessage = $localize`:@@no.users:No users have been selected.`;
  public updateSuccessMessage = $localize`:@@user.update:Update success.`;

  public userId;
  public users = [];
  public subscriptions = [];

  constructor(
    private alertService: AlertService,
    private readonly formBuilder: FormBuilder,
    private readonly userService: UserService,
    private readonly connectionService: ConnectionService,
  ) {}

  get f() {
    return this.form.controls;
  }

  async getUsers() {
    this.users = await this.userService.retrieve().toPromise() as Record<string, any>[];
  }

  selectUser(userId: string) {
    if (userId === this.form.get('userId').value) {
      this.form.patchValue({ userId: '' });
    } else {
      this.form.patchValue({ userId });
    }
  }

  setUserRole(user, role) {
    user.role = role;
  }

  async ngOnInit(): Promise<void> {
    this.form = this.formBuilder.group({
      userId: new FormControl('', Validators.required),
    });

    this.userId = this.connectionService.currentClaim.userId;
    await this.getUsers();
  }

  public async submit() {
    this.submitted = true;
    if (this.form.valid) {
      try {
        const userId = this.form.value.userId;
        const selectedUsers = this.users.filter(x => x._id === userId);
        if (selectedUsers.length) {
          for (const user of selectedUsers) {
            const userUpdate: Record<string, any> = {role: Number(user.role)};
            await this.userService.updateById(this.form.value.userId, userUpdate).toPromise();
          }
          this.alertService.success(this.updateSuccessMessage);
        } else {
          this.alertService.error(this.noUsersSelectedMessage);
        }
      } catch (error) {
        this.alertService.error(error.message);
      }
    }
    this.submitted = false;
  }
}
