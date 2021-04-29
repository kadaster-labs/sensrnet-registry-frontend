import '@angular/common/locales/global/nl';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AuthConfigModule } from './auth/auth-config.module';
import { ErrorInterceptor } from './auth/error.interceptor';
import { AuthInterceptor } from './auth/auth.interceptor';
import { ModalService } from './services/modal.service';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './login/login.component';
import { MapService } from './components/map/map.service';
import { ViewerComponent } from './viewer/viewer.component';
import { NavBarComponent } from './navbar/navbar.component';
import { MapComponent } from './components/map/map.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DeviceComponent } from './forms/device/device.component';
import { AlertComponent } from './components/alert/alert.component';
import { LanguageSwitcherComponent } from './components/language-switcher/language-switcher.component';
import { ModalComponent } from './components/modal/modal.component';
import { DevicesComponent } from './forms/devices/devices.component';
import { ThemeComponent } from './form-controls/theme/theme.component';
import { DataStreamComponent } from './form-controls/datastream/datastream.component';
import { DeviceTypeComponent } from './form-controls/device-type/device-type.component';
import { OrganizationComponent } from './components/organization/organization.component';
import { SensorStatusComponent } from './form-controls/sensor-status/sensor-status.component';
import { OrganizationJoinComponent } from './forms/organization-join/organization-join.component';
import { SensorLocationComponent } from './form-controls/sensor-location/sensor-location.component';
import { OrganizationCreateComponent } from './forms/organization-create/organization-create.component';
import { OrganizationUpdateComponent } from './forms/organization-update/organization-update.component';
import { EnvServiceProvider } from './services/env.service.provider';
import { OrganizationContactComponent } from './form-controls/organization-contact/organization-contact.component';
import {SensorComponent} from './form-controls/sensor/sensor.component';
import {OrganizationUsersComponent} from './forms/organization-users/organization-users.component';
import {TypeComponent} from './form-controls/type/type.component';

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
    DataStreamComponent,
    SensorComponent,
    OrganizationUsersComponent,
    ModalComponent,
    OrganizationComponent,
    OrganizationJoinComponent,
    OrganizationCreateComponent,
    OrganizationContactComponent,
  ], imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    AuthConfigModule,
  ], providers: [
    MapService,
    ModalService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    EnvServiceProvider,
  ], bootstrap: [
    AppComponent,
  ],
})

export class AppModule {}
