import '@angular/common/locales/global/nl';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { GgcMapModule } from 'generieke-geo-componenten-map';
import { GgcSearchModule } from 'generieke-geo-componenten-search';
import { GgcDatasetTreeModule } from 'generieke-geo-componenten-dataset-tree';
import { GgcDatasetLegendModule } from 'generieke-geo-componenten-dataset-legend';

import { AppComponent } from './app.component';
import { AuthConfigModule } from './auth/auth-config.module';
import { ErrorInterceptor } from './auth/error.interceptor';
import { AuthInterceptor } from './auth/jwt.interceptor';
import { ModalService } from './services/modal.service';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './login/login.component';
import { ViewerComponent } from './viewer/viewer.component';
import { NavBarComponent } from './navbar/navbar.component';
import { MapComponent } from './components/map/map.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SensorComponent } from './forms/sensor/sensor.component';
import { AlertComponent } from './components/alert/alert.component';
import { LanguageSwitcherComponent } from './components/language-switcher/language-switcher.component';
import { ModalComponent } from './components/modal/modal.component';
import { SensorsComponent } from './forms/sensors/sensors.component';
import { DataStreamComponent } from './form-controls/datastream/datastream.component';
import { SensorTypeComponent } from './form-controls/sensor-type/sensor-type.component';
import { OrganizationComponent } from './components/organization/organization.component';
import { SensorThemeComponent } from './form-controls/sensor-theme/sensor-theme.component';
import { SensorStatusComponent } from './form-controls/sensor-status/sensor-status.component';
import { OrganizationJoinComponent } from './forms/organization-join/organization-join.component';
import { SensorLocationComponent } from './form-controls/sensor-location/sensor-location.component';
import { OrganizationCreateComponent } from './forms/organization-create/organization-create.component';
import { OrganizationUpdateComponent } from './forms/organization-update/organization-update.component';
import { EnvServiceProvider } from './services/env.service.provider';
import { OrganizationContactComponent } from './form-controls/organization-contact/organization-contact.component';

@NgModule({
  declarations: [
    AppComponent,
    AlertComponent,
    LanguageSwitcherComponent,
    ViewerComponent,
    LoginComponent,
    SensorComponent,
    SensorThemeComponent,
    SensorLocationComponent,
    SensorTypeComponent,
    OrganizationUpdateComponent,
    SensorStatusComponent,
    NavBarComponent,
    SidebarComponent,
    MapComponent,
    SensorsComponent,
    DataStreamComponent,
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
    GgcMapModule.forRoot(),
    GgcSearchModule,
    GgcDatasetTreeModule,
    GgcDatasetLegendModule,
    HttpClientModule,
    NgbModule,
    AuthConfigModule,
  ], providers: [
    ModalService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    EnvServiceProvider,
  ], bootstrap: [
    AppComponent,
  ],
})

export class AppModule {}
