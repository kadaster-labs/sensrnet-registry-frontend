import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ViewerComponent } from './viewer/viewer.component';
import { DeviceComponent } from './forms/device/device.component';
import { DevicesComponent } from './forms/devices/devices.component';
import { OrganizationComponent } from './components/organization/organization.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },

  { path: 'viewer', component: ViewerComponent },

  { path: 'organization', component: OrganizationComponent },

  { path: 'device', component: DeviceComponent },
  { path: 'device/:id', component: DeviceComponent },

  { path: 'devices', component: DevicesComponent },

  // otherwise redirect to viewer
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
  ], exports: [
    RouterModule,
  ],
})
export class AppRoutingModule {}
