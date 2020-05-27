import { HttpClientModule } from '@angular/common/http';
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
import { SensorService } from './services/sensor.service';
import { OwnerService } from './services/owner.service';

@NgModule({
  declarations: [
    AppComponent,
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
  providers: [SensorService, OwnerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
