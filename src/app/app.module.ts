import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { GgcMapModule } from 'generieke-geo-componenten-map';
import { GgcSearchModule } from 'generieke-geo-componenten-search';
import { GgcFeatureInfoModule } from 'generieke-geo-componenten-feature-info';
import { GgcDatasetTreeModule } from 'generieke-geo-componenten-dataset-tree';
import { GgcDatasetLegendModule } from 'generieke-geo-componenten-dataset-legend';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DataService } from './services/data.service';
import { AlertComponent } from './components/alert/alert.component';
import { LoginComponent } from './login/login.component';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import { ErrorInterceptor } from './helpers/error.interceptor';
import { RegisterComponent } from './register/register.component';
import { ViewerComponent } from './viewer/viewer.component';

@NgModule({
  declarations: [
    AppComponent,
    AlertComponent,
    ViewerComponent,
    LoginComponent,
    RegisterComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    GgcMapModule.forRoot(),
    GgcSearchModule,
    GgcFeatureInfoModule,
    GgcDatasetTreeModule,
    GgcDatasetLegendModule,
    HttpClientModule,
  ],
  providers: [
    DataService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule { }
