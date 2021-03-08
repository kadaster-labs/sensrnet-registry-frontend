import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ViewerComponent } from './viewer/viewer.component';
import { SensorComponent } from './forms/sensor/sensor.component';
import { SensorsComponent } from './forms/sensors/sensors.component';
import { OrganizationComponent } from './components/organization/organization.component';

const routes: Routes = [
  { path: '', component: ViewerComponent },
  { path: 'login', component: LoginComponent },

  { path: 'organization', component: OrganizationComponent },

  { path: 'sensor', component: SensorComponent },
  { path: 'sensor/:id', component: SensorComponent },

  { path: 'sensors', component: SensorsComponent },

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
