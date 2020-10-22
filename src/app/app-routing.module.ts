import { NgModule } from '@angular/core';
import { AuthGuard } from './helpers/auth.guard';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ViewerComponent } from './viewer/viewer.component';
import { RegisterComponent } from './register/register.component';
import { SensorsComponent } from './forms/sensors/sensors.component';
import { OwnerUpdateComponent } from './forms/owner-update/owner-update.component';
import { SensorComponent } from './forms/sensor/sensor.component';

const routes: Routes = [
  { path: '', component: ViewerComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'owner', component: OwnerUpdateComponent },

  { path: 'sensor', component: SensorComponent },
  { path: 'sensor/:id', component: SensorComponent },

  { path: 'sensors', component: SensorsComponent },

  // otherwise redirect to viewer
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
