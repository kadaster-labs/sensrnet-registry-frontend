import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './helpers/auth.guard';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ViewerComponent } from './viewer/viewer.component';
import { OwnerUpdateComponent } from './owner-update/owner-update.component';
import { SensorRegisterComponent } from './sensor-register/sensor-register.component';
import { SensorUpdateComponent } from './sensor-update/sensor-update.component';

const routes: Routes = [
  { path: '', component: ViewerComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'owner', component: OwnerUpdateComponent },

  { path: 'sensor', component: SensorRegisterComponent },
  { path: 'sensor/update', component: SensorUpdateComponent },

  // otherwise redirect to viewer
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
