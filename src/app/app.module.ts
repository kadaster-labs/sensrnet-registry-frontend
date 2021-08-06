import '@angular/common/locales/global/nl';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import * as freeRegularSvgIcons from '@fortawesome/free-regular-svg-icons';
import * as freeSolidSvgIcons from '@fortawesome/free-solid-svg-icons';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthConfigModule } from './auth/auth-config.module';
import { AuthInterceptor } from './auth/auth.interceptor';
import { ErrorInterceptor } from './auth/error.interceptor';
import { AlertComponent } from './components/alert/alert.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { LanguageSwitcherComponent } from './components/language-switcher/language-switcher.component';
import { MapComponent } from './components/map/map.component';
import { MapService } from './components/map/map.service';
import { ObservationGoalComponent } from './components/observation-goal/observation-goal.component';
import { ObservationGoalsComponent } from './components/observation-goals/observation-goals.component';
import { OrganizationComponent } from './components/organization/organization.component';
import { DatastreamComponent } from './form-controls/datastream/datastream.component';
import { DeviceTypeComponent } from './form-controls/device-type/device-type.component';
import { OrganizationContactComponent } from './form-controls/organization-contact/organization-contact.component';
import { SensorLocationComponent } from './form-controls/sensor-location/sensor-location.component';
import { SensorStatusComponent } from './form-controls/sensor-status/sensor-status.component';
import { SensorComponent } from './form-controls/sensor/sensor.component';
import { ThemeComponent } from './form-controls/theme/theme.component';
import { TypeComponent } from './form-controls/type/type.component';
import { DeviceComponent } from './forms/device/device.component';
import { DevicesComponent } from './forms/devices/devices.component';
import { OrganizationCreateComponent } from './forms/organization-create/organization-create.component';
import { OrganizationJoinComponent } from './forms/organization-join/organization-join.component';
import { OrganizationUpdateComponent } from './forms/organization-update/organization-update.component';
import { OrganizationUsersComponent } from './forms/organization-users/organization-users.component';
import { LoginComponent } from './login/login.component';
import { NavBarComponent } from './navbar/navbar.component';
import { EnvServiceProvider } from './services/env.service.provider';
import { ModalService } from './services/modal.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ViewerComponent } from './viewer/viewer.component';

@NgModule({
    declarations: [
        AppComponent,
        AlertComponent,
        LanguageSwitcherComponent,
        ViewerComponent,
        LoginComponent,
        DeviceComponent,
        ThemeComponent,
        TypeComponent,
        SensorLocationComponent,
        DeviceTypeComponent,
        OrganizationUpdateComponent,
        SensorStatusComponent,
        NavBarComponent,
        SidebarComponent,
        MapComponent,
        DevicesComponent,
        DatastreamComponent,
        SensorComponent,
        OrganizationUsersComponent,
        ConfirmationModalComponent,
        ObservationGoalComponent,
        ObservationGoalsComponent,
        OrganizationComponent,
        OrganizationJoinComponent,
        OrganizationCreateComponent,
        OrganizationContactComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        FontAwesomeModule,
        NgbModule,
        AuthConfigModule,
    ],
    providers: [
        MapService,
        ModalService,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        EnvServiceProvider,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(library: FaIconLibrary) {
        // import font-awesome icons here to enable tree-shaking, making use of the "Icon Library" methodology, more info
        // here: https://github.com/FortAwesome/angular-fontawesome/blob/master/docs/usage.md#methodologies
        library.addIcons(
            freeRegularSvgIcons.faCheckSquare,
            freeSolidSvgIcons.faArrowRight,
            freeSolidSvgIcons.faBullseye,
            freeSolidSvgIcons.faChevronLeft,
            freeSolidSvgIcons.faChevronRight,
            freeSolidSvgIcons.faCity,
            freeSolidSvgIcons.faEye,
            freeSolidSvgIcons.faInfoCircle,
            freeSolidSvgIcons.faLanguage,
            freeSolidSvgIcons.faPencilAlt,
            freeSolidSvgIcons.faPlus,
            freeSolidSvgIcons.faSignOutAlt,
            freeSolidSvgIcons.faSort,
            freeSolidSvgIcons.faSortDown,
            freeSolidSvgIcons.faSortUp,
            freeSolidSvgIcons.faTrashAlt,
        );
    }
}
