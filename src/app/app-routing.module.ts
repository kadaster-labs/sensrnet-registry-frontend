import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ObservationGoalComponent } from './components/observation-goal/observation-goal.component';
import { ObservationGoalsComponent } from './components/observation-goals/observation-goals.component';
import { OrganizationComponent } from './components/organization/organization.component';
import { DeviceComponent } from './forms/device/device.component';
import { DevicesComponent } from './forms/devices/devices.component';
import { LoginComponent } from './login/login.component';
import { ViewerComponent } from './viewer/viewer.component';

const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'login', component: LoginComponent },

    { path: 'viewer', component: ViewerComponent },

    { path: 'organization', component: OrganizationComponent },

    { path: 'device', component: DeviceComponent },
    { path: 'device/:id', component: DeviceComponent },

    { path: 'devices', component: DevicesComponent },

    { path: 'observationgoal', component: ObservationGoalComponent },
    { path: 'observationgoal/:id', component: ObservationGoalComponent },

    { path: 'observationgoals', component: ObservationGoalsComponent },

    // otherwise redirect to viewer
    { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
