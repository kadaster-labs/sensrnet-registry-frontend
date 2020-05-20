import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { GgcMapModule } from 'generieke-geo-componenten-map';
import { GgcSearchModule } from 'generieke-geo-componenten-search';
import { GgcFeatureInfoModule } from 'generieke-geo-componenten-feature-info';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { NavComponent } from './nav/nav.component';
import { FormComponent } from './form/form.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    NavComponent,
    FormComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    GgcMapModule.forRoot(),
    GgcSearchModule,
    GgcFeatureInfoModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
