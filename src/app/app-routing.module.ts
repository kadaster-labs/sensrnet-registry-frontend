import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ViewerComponent } from './viewer/viewer.component';
import { DeviceComponent } from './forms/device/device.component';
import { RegisterComponent } from './register/register.component';
import { SensorsComponent } from './forms/sensors/sensors.component';
import { OrganizationComponent } from './components/organization/organization.component';

const routes: Routes = [
  { path: '', component: ViewerComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'organization', component: OrganizationComponent },

  { path: 'device', component: DeviceComponent },
  { path: 'device/:id', component: DeviceComponent },

  { path: 'devices', component: SensorsComponent },

  // otherwise redirect to viewer
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
  ], exports: [
    RouterModule,
  ],
})
export class AppRoutingModule {}
