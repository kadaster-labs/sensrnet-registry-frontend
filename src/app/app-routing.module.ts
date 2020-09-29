import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './helpers/auth.guard';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ViewerComponent } from './viewer/viewer.component';
import { OwnerUpdateComponent } from './forms/owner-update/owner-update.component';
import { SensorRegisterComponent } from './forms/sensor-register/sensor-register.component';
import { SensorUpdateComponent } from './forms/sensor-update/sensor-update.component';
import { SensorsViewComponent } from './forms/sensors-view/sensors-view.component';

const routes: Routes = [
  { path: '', component: ViewerComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'owner', component: OwnerUpdateComponent },

  { path: 'sensor', component: SensorRegisterComponent },
  { path: 'sensor/update', component: SensorUpdateComponent },

  { path: 'sensors', component: SensorsViewComponent },

  // otherwise redirect to viewer
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
